import { test, expect } from "@playwright/test";

test("landing to login flow", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.getByText("情绪记录不是填表")).toBeVisible();
  await page.getByRole("link", { name: "开始使用" }).click();
  await expect(page).toHaveURL(/\/login/);
});
