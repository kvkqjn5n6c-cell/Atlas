import { expect, test } from "@playwright/test";
import { seedCriticalCostKpi } from "./fixtures/local-storage";

test.describe("dashboard dirigeant", () => {
  test("affiche une lecture executive avec donnees locales", async ({ page }) => {
    await seedCriticalCostKpi(page);

    await page.goto("/executive");

    await expect(page.getByRole("heading", { name: /Lecture ex/i })).toBeVisible();
    await expect(page.getByText(/Lecture ex/i)).toBeVisible();
    await expect(page.getByText(/Score/i).first()).toBeVisible();
    await expect(page.getByText(/traiter en priorit/i)).toBeVisible();
    await expect(page.getByText(/Recommandations/i).first()).toBeVisible();
  });
});
