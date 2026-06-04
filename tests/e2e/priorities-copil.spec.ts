import { expect, test } from "@playwright/test";
import { seedCriticalCostKpi } from "./fixtures/local-storage";

test.describe("priorites et COPIL", () => {
  test("affiche les priorites et un brief COPIL copiable", async ({ page }) => {
    await seedCriticalCostKpi(page);

    await page.goto("/priorities");

    await expect(page.getByRole("heading", { name: /Ce qui m/i })).toBeVisible();
    await expect(page.getByText(/Top 5/i)).toBeVisible();
    await expect(page.getByText(/sous-traitance|Score/i).first()).toBeVisible();

    await page.goto("/copil");

    await expect(page.getByRole("heading", { name: /Pr/i }).first()).toBeVisible();
    await expect(page.getByText(/Brief/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Copier le brief/i })).toBeVisible();
    await expect(page.getByText(/Points|Prochaines actions|Priorit/i).first()).toBeVisible();
  });
});
