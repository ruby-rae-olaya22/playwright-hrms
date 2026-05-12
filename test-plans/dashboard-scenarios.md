# OrangeHRM Dashboard Page — Test Scenarios

> **Target URL:** `https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index`
> **Valid Credentials:** `Admin` / `admin123`
> **Notes:** Dashboard access requires successful login first. Existing login automation lives in `tests/login.spec.ts`; there is no dedicated dashboard page object in the repository yet.

---

## 1. ✅ Positive Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| P-01 | Login and verify dashboard loads | `Admin` / `admin123` | Redirect to `/dashboard/index`; page heading shows "Dashboard" |
| P-02 | Verify dashboard header and user menu | Valid creds | `h6` or page header contains "Dashboard"; user dropdown displays "Admin" |
| P-03 | Verify top navigation is visible | Valid creds | Main dashboard nav items are visible |
| P-04 | Verify dashboard widgets load | Valid creds | At least one dashboard widget is visible and not empty |
| P-05 | Verify quick launch links render | Valid creds | Quick launch area contains expected buttons/icons |
| P-06 | Verify "Apply Leave" or common dashboard action is clickable | Valid creds | Action link/button is interactable |
| P-07 | Verify refresh does not break dashboard | Valid creds + page refresh | Dashboard remains on `/dashboard/index` and content reloads |

---

## 2. ❌ Negative / Guard Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| N-01 | Direct access to dashboard without login | Open dashboard URL | Redirect to login page |
| N-02 | Invalid session token / expired session | Login, logout, then use back button | Should not show dashboard content |
| N-03 | Broken widget fallback | Simulated failed widget API (manual) | Page shows error state or fallback, not blank page |
| N-04 | Slow loading dashboard content | Throttled network | Dashboard loads gracefully or displays spinner, no crash |
| N-05 | Logout from dashboard | Valid creds | User is redirected to login page |

---

## 3. 📏 Boundary Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| B-01 | Dashboard on small mobile viewport | 375x667 | Dashboard remains usable, header and main widgets visible |
| B-02 | Dashboard on tablet viewport | 768x1024 | Dashboard layout adapts, nav and widgets visible |
| B-03 | Dashboard on large desktop viewport | 1920x1080 | Layout scales, no broken containers |

---

## 4. 🔀 Edge Case Scenarios

| # | Scenario | Test Data | Expected Result |
|---|----------|-----------|-----------------|
| E-01 | Browser back button after login | Login → back | Should remain on dashboard or redirect appropriately |
| E-02 | Refresh after logout | Logout → refresh dashboard URL | Should remain at login or show expired session |
| E-03 | Multiple tabs — login in one tab, open dashboard in another | Valid creds in Tab 1, open dashboard in Tab 2 | Tab 2 sees dashboard if session shared |
| E-04 | Network offline after dashboard load | Load dashboard → go offline | Page should not crash; may show offline state |
| E-05 | Resize while on dashboard | Resize window quickly | UI remains usable and responsive |

---

## 5. 🎨 UI/UX Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| U-01 | Dashboard page title is correct | Page title contains `OrangeHRM` |
| U-02 | Dashboard heading text is visible | Heading shows "Dashboard" |
| U-03 | User avatar/menu is visible | Admin user menu is present |
| U-04 | Notification icon or banner displays | Dashboard notification area is visible |
| U-05 | Dashboard cards/widgets are clearly labeled | Each widget has a title and value |

---

## 6. 🔒 Security Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| S-01 | Dashboard access requires authentication | Direct access redirects to login |
| S-02 | Session cookie uses secure attributes | Cookie has `Secure`/`HttpOnly`/`SameSite` when possible |
| S-03 | No sensitive data in URL | URL contains no password or auth token |
| S-04 | Logout clears authenticated dashboard access | After logout, dashboard not accessible |

---

## 7. ♿ Accessibility Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| A-01 | Dashboard header has accessible semantics | Header uses correct heading level |
| A-02 | Dashboard links/buttons have accessible names | Quick launch and widget actions have names |
| A-03 | Keyboard-only navigation works | Can tab through main dashboard controls |
| A-04 | Focus state is visible | Focus ring visible on interactive elements |
| A-05 | Important dashboard alerts are announced | Alert or notification uses `aria-live` or role `alert` |

---

## 8. Priority Matrix for Automation

| Priority | Scenarios | Why |
|----------|-----------|-----|
| 🔴 P0 | P-01, P-02, N-01, N-05 | Core dashboard access and session guard |
| 🟠 P1 | P-03, P-04, E-01, E-02 | Important UI and stability coverage |
| 🟡 P2 | U-01 to U-05, A-01 to A-05 | UX/accessibility and polish |
| 🟢 P3 | B-01 to B-03, E-03, E-04 | Responsive behavior and multi-tab flows |

---

> **Tip:** Start automation by verifying successful login transitions to `/dashboard/index`, then add dashboard-specific checks for header, widgets, and auth guards.
