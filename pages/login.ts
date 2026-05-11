import { Page, Locator } from '@playwright/test';

export class LoginPage {
  // 1. We name our "bricks" (Locators)
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox',{name:'username'});//locator('[data-test="username"]');
    this.passwordInput = page.getByRole('textbox',{name:'password'});
    this.loginButton = page.getByRole('button',{name:'login'});
  }

  // 2. We define "actions"
  async goTo() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  }

  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}