import { Page, Locator } from '@playwright/test';

export class LoginPage {
  // Locators
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly usernameRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly forgotPasswordLink: Locator;
  readonly orangeHRMLink: Locator;
  readonly logo: Locator;
  readonly credentialHints: Locator;
  readonly versionText: Locator;
  readonly copyrightText: Locator;
  readonly socialMediaLinks: Locator;
  readonly resetPasswordHeader: Locator;
  readonly resetPasswordUsernameInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly resetPasswordCancelButton: Locator;
  readonly businessWebsiteHeader: Locator;
  readonly businessWebsiteLink: string;
  readonly clientBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'username' });
    this.passwordInput = page.getByRole('textbox', { name: 'password' });
    this.loginButton = page.getByRole('button', { name: 'login' });

    // Error/validation locators
    this.errorMessage = page.locator('.oxd-alert-content--error');
    this.usernameRequiredError = page.locator('.oxd-input-group:has(input[name="username"]) span.oxd-input-group__message');
    this.passwordRequiredError = page.locator('.oxd-input-group:has(input[name="password"]) span.oxd-input-group__message');

    // Page element locators
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot-header');
    this.orangeHRMLink = page.getByRole('link', { name: 'OrangeHRM, Inc' });
    this.logo = page.locator('.orangehrm-login-branding img');
    this.credentialHints = page.locator('.orangehrm-login-slot');
    this.versionText = page.locator('.orangehrm-copyright-wrapper p').first();
    this.copyrightText = page.locator('.orangehrm-copyright-wrapper p').nth(1);
    this.socialMediaLinks = page.locator('.orangehrm-login-footer-sm a');

    // Reset password page locators
    this.resetPasswordHeader = page.locator('h6');
    this.resetPasswordUsernameInput = page.getByRole('textbox', { name: 'username' });
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });
    this.resetPasswordCancelButton = page.getByRole('button', { name: 'Cancel' });

    // Business website locators
    this.businessWebsiteHeader = page.locator('.page-title h1');
    this.businessWebsiteLink = 'https://orangehrm.com/';

    // Logged-in user locators
    this.clientBanner = page.getByRole('link', { name: 'client brand banner' })
  }

  // Actions
  async goTo() {
    await this.page.goto(
      'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login'
    );
  }

  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  async clearAndSubmit() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.loginButton.click();
  }

  async submitWithEnter(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.passwordInput.press('Enter');
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async navigateToOrangeHRM() {
    await this.orangeHRMLink.click();
  }

  async logout() {
    await this.page.locator('.oxd-userdropdown-tab').click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}