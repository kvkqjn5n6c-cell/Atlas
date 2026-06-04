import { expect, test } from "@playwright/test";
import { clearAtlasLocalStorage } from "./fixtures/local-storage";

test.describe("Atlas Memory", () => {
  test.beforeEach(async ({ page }) => {
    await clearAtlasLocalStorage(page);
  });

  test("permet de consulter, modifier, sauvegarder, valider et rechercher", async ({ page }) => {
    await page.goto("/atlas-memory");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Atlas Memory|moire m/i })).toBeVisible();
    await expect(page.getByText(/entreprise\.md/).first()).toBeVisible();

    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();
    await textarea.fill("Objectif : Réduire la sous-traitance\nRègle : Arbitrer tout dépassement critique\n");
    await page.getByRole("button", { name: /Sauvegarder/i }).click();
    await expect(page.getByText(/Document sauvegard/i)).toBeVisible();

    const approveButtons = page.getByRole("button", { name: /Valider/i });
    if ((await approveButtons.count()) > 0) {
      await approveButtons.first().click();
      await expect(page.getByText(/valid/i).first()).toBeVisible();
    }

    await page.getByRole("searchbox").fill("sous-traitance");
    await expect(page.getByText(/Terme|sous-traitance/i).first()).toBeVisible();
  });
});
