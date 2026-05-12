# OrangeHRM Login Page — Test Scenarios

> **Target URL:** `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`
> **Valid Credentials:** `Admin` / `admin123`
> **Existing Page Object:** [login.ts](file:///c:/Users/ruby_thinkbitsolutio/Documents/Playwright%20Learn/HRMS/playwright-hrms/pages/login.ts) · **Existing Spec:** [login.spec.ts](file:///c:/Users/ruby_thinkbitsolutio/Documents/Playwright%20Learn/HRMS/playwright-hrms/tests/login.spec.ts)

---

## 1. ✅ Positive Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| P-01 | Login with valid credentials | `Admin` / `admin123` | Redirect to `/dashboard/index`, dashboard is visible |
| P-02 | Login and verify dashboard elements | Valid creds | Dashboard page title shows "Dashboard", user dropdown shows "Admin" |
| P-03 | Login after a previous logout | Valid creds → Logout → Valid creds | Successful re-login, dashboard loads |
| P-04 | Login with username having leading/trailing spaces | `" Admin "` / `admin123` | ⚠️ Verify behavior — may succeed (trimmed) or fail |
| P-05 | Verify "Forgot your password?" link navigates correctly | Click link | Navigates to `/requestPasswordResetCode`, "Reset Password" form visible |
| P-06 | Verify page title is "OrangeHRM" | — | `page.title()` === `"OrangeHRM"` |
| P-07 | Verify OrangeHRM logo is visible on login page | — | Logo image is visible |
| P-08 | Verify demo credentials hint is displayed | — | Text box shows `Username : Admin` and `Password : admin123` |

---

## 2. ❌ Negative Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| N-01 | Login with invalid username | `InvalidUser` / `admin123` | Error: "Invalid credentials" |
| N-02 | Login with invalid password | `Admin` / `wrongpass` | Error: "Invalid credentials" |
| N-03 | Login with both invalid credentials | `FakeUser` / `FakePass` | Error: "Invalid credentials" |
| N-04 | Login with empty username | ` ` / `admin123` | Validation: "Required" shown under username |
| N-05 | Login with empty password | `Admin` / ` ` | Validation: "Required" shown under password |
| N-06 | Login with both fields empty | ` ` / ` ` | Validation: "Required" shown under both fields |
| N-07 | Login with correct username, wrong case password | `Admin` / `Admin123` | Error: "Invalid credentials" (password is case-sensitive) |
| N-08 | Login with wrong case username | `admin` / `admin123` | ⚠️ Verify — may succeed or fail depending on case sensitivity |
| N-09 | Login with SQL injection in username | `' OR 1=1 --` / `admin123` | Error: "Invalid credentials", no SQL error exposed |
| N-10 | Login with XSS payload in username | `<script>alert(1)</script>` / `admin123` | Error message, no script execution |
| N-11 | Login with special characters only | `!@#$%^&*` / `!@#$%^&*` | Error: "Invalid credentials" |

---

## 3. 📏 Boundary Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| B-01 | Username with 1 character | `A` / `admin123` | Error: "Invalid credentials" |
| B-02 | Password with 1 character | `Admin` / `a` | Error: "Invalid credentials" |
| B-03 | Username with very long string (255+ chars) | `"A".repeat(256)` / `admin123` | Error or graceful rejection, no crash |
| B-04 | Password with very long string (255+ chars) | `Admin` / `"a".repeat(256)` | Error or graceful rejection, no crash |
| B-05 | Username with max valid length | Depends on system limit | Verify app handles gracefully |
| B-06 | Single space as username | `" "` / `admin123` | Validation: "Required" (if trimmed) or "Invalid credentials" |
| B-07 | Single space as password | `Admin` / `" "` | Validation: "Required" (if trimmed) or "Invalid credentials" |

---

## 4. 🔀 Edge Case Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| E-01 | Double-click login button | Valid creds + rapid double-click | Single login, no duplicate requests or errors |
| E-02 | Press Enter key to submit (instead of button click) | Valid creds + `Enter` | Successful login, same as clicking Login button |
| E-03 | Tab order through form fields | `Tab` navigation | Focus order: Username → Password → Login button |
| E-04 | Paste credentials from clipboard | Paste `Admin` and `admin123` | Fields accept pasted values, login succeeds |
| E-05 | Login with browser back button after logout | Login → Logout → Browser Back | Should NOT return to dashboard; redirect to login or show session expired |
| E-06 | Login on slow network (simulated) | Valid creds + throttled network | Login succeeds (may take longer), no timeout crash |
| E-07 | Refresh page mid-login | Fill fields → F5 → Re-fill → Submit | Fields cleared, login works after re-entry |
| E-08 | Navigate directly to dashboard URL without login | Go to `/dashboard/index` directly | Redirect to login page |
| E-09 | Login with JavaScript disabled | — | ⚠️ Manual only — form should degrade gracefully |
| E-10 | Multiple tabs — login in one, access dashboard in other | Login in Tab 1, open dashboard URL in Tab 2 | Tab 2 shows dashboard (session shared) |
| E-11 | Unicode characters in username | `Ädmin` / `admin123` | Error: "Invalid credentials", no crash |
| E-12 | Emoji in password field | `Admin` / `🔑🔑🔑` | Error: "Invalid credentials", no crash |
| E-13 | Login with credentials containing HTML entities | `&lt;Admin&gt;` / `admin123` | Error: "Invalid credentials" |

---

## 5. 🎨 UI/UX Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| U-01 | Verify placeholder text in username field | Placeholder = `"Username"` |
| U-02 | Verify placeholder text in password field | Placeholder = `"Password"` |
| U-03 | Verify password field masks input | Input type is `password`, characters are masked |
| U-04 | Verify login button is orange and visible | Button has correct styling and is enabled |
| U-05 | Verify error message styling (red alert box) | Error div has red/orange background with readable text |
| U-06 | Verify footer shows correct version | Text includes `"OrangeHRM OS 5.8"` |
| U-07 | Verify copyright text | `"© 2005 - 2026 OrangeHRM, Inc. All rights reserved."` |
| U-08 | Verify social media links are present | LinkedIn, Facebook, Twitter, YouTube icons are visible |
| U-09 | Responsive — login form visible on mobile viewport | `page.setViewportSize({ width: 375, height: 667 })` — form still usable |
| U-10 | Responsive — login form visible on tablet viewport | `page.setViewportSize({ width: 768, height: 1024 })` — form still usable |

---

## 6. 🔒 Security Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| S-01 | Password not visible in page source/DOM | Password input value not in plain text in DOM attributes |
| S-02 | No autocomplete on password field | `autocomplete="off"` or similar attribute present |
| S-03 | HTTPS connection enforced | URL uses `https://` protocol |
| S-04 | Error message does not reveal which field is wrong | Message says "Invalid credentials" — NOT "Invalid username" or "Invalid password" |
| S-05 | Session cookie flags | Cookie has `HttpOnly`, `Secure`, `SameSite` attributes |
| S-06 | No sensitive data in URL after login | Password not in query parameters |

---

## 7. ♿ Accessibility Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| A-01 | Username input has accessible label | `aria-label` or associated `<label>` present |
| A-02 | Password input has accessible label | `aria-label` or associated `<label>` present |
| A-03 | Login button has accessible name | `role="button"` with name `"Login"` |
| A-04 | Error messages announced to screen readers | Error has `role="alert"` or `aria-live` attribute |
| A-05 | Keyboard-only navigation works end-to-end | Can complete login using only keyboard |

---

## Priority Matrix for Automation

| Priority | Scenarios | Rationale |
|----------|-----------|-----------|
| 🔴 **P0 — Must automate** | P-01, N-01 to N-06, E-02, E-08 | Core login flow + critical guards |
| 🟠 **P1 — Should automate** | P-03, P-05, N-07, N-08, E-01, E-05, B-03, B-04, S-04 | Regression safety net |
| 🟡 **P2 — Nice to have** | P-06 to P-08, U-01 to U-10, A-01 to A-05, S-01 to S-06 | Visual/accessibility coverage |
| 🟢 **P3 — Manual or deferred** | E-06, E-09, E-10, N-09, N-10 | Hard to automate or low ROI |

---

> [!TIP]
> Start by automating all **P0** scenarios — they cover the happy path and the most common failure modes. You already have P-01 implemented. Next, tackle the **N-01 to N-06** negative cases since they're quick wins with your existing `LoginPage` POM.

> [!NOTE]
> Some scenarios (P-04, N-08) are marked with ⚠️ because the behavior depends on OrangeHRM's backend implementation. Run them once manually to determine the expected result, then codify.
