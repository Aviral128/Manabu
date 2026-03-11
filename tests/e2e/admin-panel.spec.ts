import { expect, test } from "@playwright/test";

test("admin gating and platform admin dropdown work", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:3001/dashboard");
  await expect(page).toHaveURL(/(127\.0\.0\.1|localhost):3000\/login/);

  await page.getByLabel("Email").fill("aviral@manabu.app");
  await page.getByLabel("Password").fill("StrongPass123");
  await Promise.all([
    page.waitForURL(/(127\.0\.0\.1|localhost):3001\/dashboard$/, { timeout: 45000 }),
    page.locator("form").getByRole("button", { name: "Login" }).click(),
  ]);
  await expect(page.getByText("A live pulse of operations, trust, and learning velocity across the platform.")).toBeVisible();

  await page.getByRole("button", { name: /Open user menu/i }).click();
  await expect(page.getByText("Profile summary")).toBeVisible();
  await page.getByRole("button", { name: /Profile summary/i }).click();
  await expect(page).toHaveURL(/\/users$/);

  await page.goto("http://localhost:3001/admin-controls");
  await expect(page.getByText("Admin Controls")).toBeVisible();

  await page.goto("http://localhost:3001/quizzes");
  await expect(page.getByText("Create, edit, and delete persistent quizzes stored in the shared backend.")).toBeVisible();

  await context.close();
});
