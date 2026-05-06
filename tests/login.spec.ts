import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import dotenv from 'dotenv';

dotenv.config();

test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Step 1: Go to the site
    await loginPage.goTo();

    // Step 2: Use the login box we made earlier
    if (!process.env.USERNAME_login || !process.env.PASSWORD_login) {
        throw new Error('Missing environment variables');
    }
    await loginPage.login(process.env.USERNAME_login, process.env.PASSWORD_login);

    // Step 3: Check if it worked (The "Assertion").  We check if the URL now says "inventory"
    await expect(page).toHaveURL(/.*inventory/);
});