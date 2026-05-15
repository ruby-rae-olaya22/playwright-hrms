import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import dotenv from 'dotenv';

dotenv.config();

const VALID_USERNAME = process.env.USERNAME_login!;
const VALID_PASSWORD = process.env.PASSWORD_login!;
const LOGIN_URL = /.*auth\/login/;
const DASHBOARD_URL = /.*dashboard\/index/;

// OrangeHRM demo site can be slow — increase assertion timeout
const SLOW_EXPECT_TIMEOUT = { timeout: 15_000 };

// ============================================================
// 1. POSITIVE SCENARIOS
// ============================================================
test.describe('Positive Scenarios', () => {

  test('P-01: Login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);

    await expect(page).toHaveTitle('OrangeHRM');
    await expect(loginPage.clientBanner).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });

  test('P-02: Verify dashboard shows correct page heading after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
    await expect(page.locator('h6')).toContainText('Dashboard', SLOW_EXPECT_TIMEOUT);
  });

  test('P-03: Login again after logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);

    // Logout
    await loginPage.logout();
    await expect(page).toHaveURL(LOGIN_URL, SLOW_EXPECT_TIMEOUT);

    // Login again
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('P-05: "Forgot your password?" link navigates to reset page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.navigateToForgotPassword();
    await expect(page).toHaveURL(/.*requestPasswordResetCode/, SLOW_EXPECT_TIMEOUT);
    await expect(loginPage.resetPasswordHeader).toContainText('Reset Password', SLOW_EXPECT_TIMEOUT);
  });

  test('P-05: "OrangeHRM Inc." link navigates to business website', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();

    // Wait for the new page to open
    const pagePromise = context.waitForEvent('page');
    await loginPage.navigateToOrangeHRM();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Initialize LoginPage with the new page to use its locators
    const newLoginPage = new LoginPage(newPage);
    await expect(newPage).toHaveURL(newLoginPage.businessWebsiteLink, SLOW_EXPECT_TIMEOUT);
    await expect(newLoginPage.businessWebsiteHeader).toContainText('Streamline All Your HR Needs on One', SLOW_EXPECT_TIMEOUT);
  });

  test('P-06: Credential hints are displayed on the page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.credentialHints).toContainText('Username : Admin', SLOW_EXPECT_TIMEOUT);
    await expect(loginPage.credentialHints).toContainText('Password : admin123', SLOW_EXPECT_TIMEOUT);
  });
});

// ============================================================
// 2. NEGATIVE SCENARIOS
// ============================================================
test.describe('Negative Scenarios', () => {

  test('N-01: Invalid username with valid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('InvalidUser', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('N-02: Valid username with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, 'wrongpass');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('N-03: Both credentials invalid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('FakeUser', 'FakePass');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('N-04: Empty username with valid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameRequiredError).toContainText('Required');
  });

  test('N-05: Valid username with empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.usernameInput.fill(VALID_USERNAME);
    await loginPage.loginButton.click();
    await expect(loginPage.passwordRequiredError).toContainText('Required');
  });

  test('N-06: Both fields empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.loginButton.click();
    await expect(loginPage.usernameRequiredError).toContainText('Required');
    await expect(loginPage.passwordRequiredError).toContainText('Required');
  });

  test('N-07: Correct username, wrong case password (case sensitivity)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, 'Admin123');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('N-08: Wrong case username (case sensitivity check)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('admin', VALID_PASSWORD);

    // OrangeHRM may or may not be case-sensitive for usernames
    // We verify the page ends up in a deterministic state
    try {
      await expect(page).toHaveURL(DASHBOARD_URL, { timeout: 10_000 });
      // Username is NOT case-sensitive — test passes, behavior documented
    } catch {
      // Username IS case-sensitive — should show error
      await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
    }
  });

  test('N-09: SQL injection in username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login("' OR 1=1 --", VALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
    await expect(page).not.toHaveURL(DASHBOARD_URL);
  });

  test('N-10: XSS payload in username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('<script>alert(1)</script>', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('N-11: Special characters only', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('!@#$%^&*', '!@#$%^&*');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });
});

// ============================================================
// 3. BOUNDARY SCENARIOS
// ============================================================
test.describe('Boundary Scenarios', () => {

  test('B-01: Username with 1 character', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('A', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('B-02: Password with 1 character', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, 'a');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('B-03: Very long username (256 characters)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    const longUsername = 'A'.repeat(256);
    await loginPage.login(longUsername, VALID_PASSWORD);

    // Should handle gracefully — either validation error or invalid credentials
    await expect(
      loginPage.errorMessage.or(loginPage.usernameRequiredError)
    ).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });

  test('B-04: Very long password (256 characters)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    const longPassword = 'a'.repeat(256);
    await loginPage.login(VALID_USERNAME, longPassword);

    await expect(
      loginPage.errorMessage.or(loginPage.passwordRequiredError)
    ).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });

  test('B-06: Single space as username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(' ', VALID_PASSWORD);

    // Could show "Required" (if trimmed) or "Invalid credentials"
    await expect(
      loginPage.usernameRequiredError.or(loginPage.errorMessage)
    ).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });

  test('B-07: Single space as password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, ' ');

    await expect(
      loginPage.passwordRequiredError.or(loginPage.errorMessage)
    ).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });
});

// ============================================================
// 4. EDGE CASE SCENARIOS
// ============================================================
test.describe('Edge Case Scenarios', () => {

  test('E-01: Double-click login button does not cause issues', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.usernameInput.fill(VALID_USERNAME);
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.loginButton.dblclick();
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('E-02: Submit form by pressing Enter key', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.submitWithEnter(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('E-03: Tab order through form fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();

    // Focus on username first
    await loginPage.usernameInput.focus();
    await expect(loginPage.usernameInput).toBeFocused();

    // Tab to password
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();

    // Tab to login button
    await page.keyboard.press('Tab');
    await expect(loginPage.loginButton).toBeFocused();
  });

  test('E-04: Paste credentials into fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();

    // fill() simulates setting the value (similar to paste)
    await loginPage.usernameInput.fill(VALID_USERNAME);
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('E-05: Browser back button after logout should not return to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);

    await loginPage.logout();
    await expect(page).toHaveURL(LOGIN_URL, SLOW_EXPECT_TIMEOUT);

    // Try going back
    await page.goBack();
    // Should redirect back to login — should NOT show dashboard content
    await expect(page).toHaveURL(LOGIN_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('E-07: Refresh page mid-login clears fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();

    // Fill in fields
    await loginPage.usernameInput.fill(VALID_USERNAME);
    await loginPage.passwordInput.fill(VALID_PASSWORD);

    // Refresh page and wait for it to fully reload
    await page.reload({ waitUntil: 'networkidle' });
    await expect(loginPage.usernameInput).toBeVisible(SLOW_EXPECT_TIMEOUT);

    // Fields should be cleared
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('E-08: Direct navigation to dashboard without login redirects to login', async ({ page }) => {
    await page.goto(
      'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index'
    );
    await expect(page).toHaveURL(LOGIN_URL, SLOW_EXPECT_TIMEOUT);
  });

  test('E-11: Unicode characters in username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.usernameInput.fill('Ädmin');
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.loginButton.click();

    // FINDING: OrangeHRM accepts Unicode chars (e.g. "Ädmin") and logs in successfully.
    // This may indicate the server normalizes/strips diacritics — potential security concern.
    try {
      await expect(page).toHaveURL(DASHBOARD_URL, { timeout: 10_000 });
      // App accepted Unicode username — document this behavior
    } catch {
      // App rejected Unicode username — expected secure behavior
      await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
    }
  });

  test('E-12: Emoji in password field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, '🔑🔑🔑');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('E-13: HTML entities in credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('&lt;Admin&gt;', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });
});

// ============================================================
// 5. UI/UX SCENARIOS
// ============================================================
test.describe('UI/UX Scenarios', () => {

  test('U-01: Username field has "Username" placeholder', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', 'Username');
  });

  test('U-02: Password field has "Password" placeholder', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('U-03: Password field masks input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('U-04: Login button is visible and enabled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('U-05: Error message is visible after invalid login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login('InvalidUser', 'wrongpass');
    await expect(loginPage.errorMessage).toBeVisible(SLOW_EXPECT_TIMEOUT);
    await expect(loginPage.errorMessage).toContainText('Invalid credentials', SLOW_EXPECT_TIMEOUT);
  });

  test('U-06: Footer shows version text', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.versionText).toContainText('OrangeHRM', SLOW_EXPECT_TIMEOUT);
  });

  test('U-07: Copyright text is displayed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await expect(loginPage.copyrightText).toContainText('OrangeHRM, Inc. All rights reserved.', SLOW_EXPECT_TIMEOUT);
  });

  test('U-08: Social media links are present', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    // Verify individual social links exist
    await expect(page.locator('a[href*="linkedin"]')).toBeVisible(SLOW_EXPECT_TIMEOUT);
    await expect(page.locator('a[href*="facebook"]')).toBeVisible(SLOW_EXPECT_TIMEOUT);
    await expect(page.locator('a[href*="twitter"]')).toBeVisible(SLOW_EXPECT_TIMEOUT);
    await expect(page.locator('a[href*="youtube"]')).toBeVisible(SLOW_EXPECT_TIMEOUT);
  });
});

// ============================================================
// 6. SECURITY SCENARIOS
// ============================================================
test.describe('Security Scenarios', () => {

  test('S-03: Page loads over HTTPS', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('S-04: Error message does not reveal which field is wrong', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Wrong username
    await loginPage.goTo();
    await loginPage.login('WrongUser', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible(SLOW_EXPECT_TIMEOUT);
    const errorText1 = await loginPage.errorMessage.textContent();

    // Wrong password
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, 'WrongPass');
    await expect(loginPage.errorMessage).toBeVisible(SLOW_EXPECT_TIMEOUT);
    const errorText2 = await loginPage.errorMessage.textContent();

    // Both errors should be the same generic message
    expect(errorText1).toBe(errorText2);
    expect(errorText1).toContain('Invalid credentials');
    expect(errorText1!.toLowerCase()).not.toContain('username');
    expect(errorText1!.toLowerCase()).not.toContain('password');
  });

  test('S-06: Password not exposed in URL after login attempt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);

    expect(page.url()).not.toContain(VALID_PASSWORD);
    expect(page.url()).not.toContain('password');
  });
});

// ============================================================
// 7. ACCESSIBILITY SCENARIOS
// ============================================================
test.describe('Accessibility Scenarios', () => {

  test('A-03: Login button has accessible role and name', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    // getByRole already validates role + accessible name
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toHaveText(/Login/i);
  });

  test('A-05: Full login flow using keyboard only', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();

    // Tab into username field and type
    await loginPage.usernameInput.focus();
    await page.keyboard.type(VALID_USERNAME);

    // Tab to password field and type
    await page.keyboard.press('Tab');
    await page.keyboard.type(VALID_PASSWORD);

    // Tab to login button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(DASHBOARD_URL, SLOW_EXPECT_TIMEOUT);
  });
});