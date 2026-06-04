import { expect, test } from "@playwright/test";
import { seedCriticalCostKpi } from "./fixtures/local-storage";

test.describe("recommandation vers plan d'action", () => {
  test("cree un plan local depuis une recommandation Atlas", async ({ page }) => {
    await seedCriticalCostKpi(page);

    await page.goto("/pilotage");

    await expect(page.getByText(/Recommandations Atlas/i)).toBeVisible();
    const createPlanButton = page.getByRole("button", { name: /plan d.action/i }).first();
    await expect(createPlanButton).toBeVisible();
    await createPlanButton.click();

    await expect(page.getByText(/Plan d.action local/i).first()).toBeVisible();

    await page.goto("/action-plans");

    await expect(page.getByRole("heading", { name: /Actions issues/i })).toBeVisible();
    await expect(page.getByText(/Plan local/i)).toBeVisible();
    await expect(page.getByText(/Depuis recommandation Atlas/i)).toBeVisible();
    await expect(page.getByText(/sous-traitance|coût/i).first()).toBeVisible();
  });
});
