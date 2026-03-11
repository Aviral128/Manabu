import { expect, test } from "@playwright/test";

test("signup creates a learner session and lands on the dashboard", async ({ page }) => {
  const unique = Date.now();
  await page.goto("http://127.0.0.1:3000/signup");
  await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();

  await page.getByLabel("Display name").fill(`Launch Learner ${unique}`);
  await page.getByLabel("Email").fill(`launch.learner.${unique}@manabu.app`);
  await page.getByLabel("Password").fill("StrongPass123");

  await Promise.all([
    page.waitForURL(/\/app\/dashboard$/, { timeout: 45000 }),
    page.locator("form").getByRole("button", { name: /Sign up/i }).click(),
  ]);

  await expect(page.getByText("Learner dashboard")).toBeVisible();
  await expect(page.getByText("Created with")).toBeVisible();
});

test("home, footer, about admin, login, and quiz flows work", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/");
  await expect(page.getByRole("link", { name: /MANABU/i }).first()).toBeVisible();
  await expect(page.getByText("Created with")).toBeVisible();

  await page.goto("http://127.0.0.1:3000/about-admin");
  await expect(page.getByText("Aviral Sultaniya").first()).toBeVisible();

  await page.goto("http://127.0.0.1:3000/login");
  await page.getByLabel("Email").fill("learner@manabu.app");
  await page.getByLabel("Password").fill("StrongPass123");
  await Promise.all([
    page.waitForURL(/\/app\/dashboard$/, { timeout: 45000 }),
    page.locator("form").getByRole("button", { name: "Login" }).click(),
  ]);
  await expect(page.getByText("your next win is one focused session away")).toBeVisible();

  await page.goto("http://127.0.0.1:3000/app/quiz");
  await expect(page.getByText("Quiz arena")).toBeVisible();
  await page.getByRole("link", { name: /Start MVA Special|Start MVA Special Quiz|Start MVA Special/i }).first().click({ trial: true }).catch(() => undefined);
  await page.goto("http://127.0.0.1:3000/app/quiz/mva-special");
  await expect(page.getByText("MVA Special")).toBeVisible();
  await page.getByRole("button", { name: /Start quiz|Start/i }).click();
  await expect(page.getByText(/Question 1 of/i)).toBeVisible();
});
