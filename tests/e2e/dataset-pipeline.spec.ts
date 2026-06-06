import { expect, test } from "@playwright/test";
import { clearAtlasLocalStorage } from "./fixtures/local-storage";

test.describe("pipeline Dataset", () => {
  test.beforeEach(async ({ page }) => {
    await clearAtlasLocalStorage(page);
  });

  test("affiche la vue pipeline et la prochaine etape", async ({ page }) => {
    await page.goto("/dataset-pipeline");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Pipeline Dataset Atlas/i }).first()).toBeVisible();
    await expect(page.getByText(/Prochaine étape recommandée/i)).toBeVisible();
    await expect(page.getByText(/Connexion SQL/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sources", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Datasets", exact: true })).toBeVisible();
  });
});
