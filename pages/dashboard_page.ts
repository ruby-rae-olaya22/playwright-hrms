import { Page, Locator } from '@playwright/test';
export class DashboardPage {
    readonly page: Page;
    readonly header: Locator;
    readonly user_profile_icon: Locator;
    readonly user_profile_menu: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('h6');
        this.user_profile_icon = page.locator('#app header div > div:nth-child(3)');
        this.user_profile_menu = page.locator('#app header ul li ul');
    }

    async navigateToDashboard() {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    }
}