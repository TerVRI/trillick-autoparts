import { test, expect } from "@playwright/test";

test.describe("OBD Dashboard", () => {
  test("loads dashboard page with title and tabs", async ({ page }) => {
    await page.goto("/tools/diagnostics/obd-dashboard");
    await expect(page.getByRole("heading", { name: /OBD Dashboard/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dashboard", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Diagnostics", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Car profile", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sessions", exact: true })).toBeVisible();
  });

  test("simulator connect shows live gauges", async ({ page }) => {
    await page.goto("/tools/diagnostics/obd-dashboard");
    await page.getByTestId("obd-transport-select").selectOption("simulator");
    await page.getByRole("button", { name: /^Connect$/i }).click();
    await expect(page.locator("span").filter({ hasText: /^connected$/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Engine RPM")).toBeVisible();
    await expect(page.getByText("Vehicle lowdown")).toBeVisible();
  });

  test("diagnostics tab shows simulator DTCs after connect", async ({ page }) => {
    await page.goto("/tools/diagnostics/obd-dashboard");
    await page.getByTestId("obd-transport-select").selectOption("simulator");
    await page.getByRole("button", { name: /^Connect$/i }).click();
    await expect(page.locator("span").filter({ hasText: /^connected$/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Refresh diagnostics" }).click();
    await page.getByRole("button", { name: "Diagnostics", exact: true }).click();
    await expect(page.getByText("P0420")).toBeVisible({ timeout: 15_000 });
  });

  test("car profile tab allows editing vehicle label", async ({ page }) => {
    await page.goto("/tools/diagnostics/obd-dashboard");
    await page.getByRole("button", { name: "Car profile", exact: true }).click();
    const profileInput = page.locator('section:has-text("Car configurator") input').first();
    await profileInput.fill("Test Defender");
    await expect(profileInput).toHaveValue("Test Defender");
  });

  test("appears in tools hub", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("link", { name: /OBD Dashboard/i })).toBeVisible();
  });
});
