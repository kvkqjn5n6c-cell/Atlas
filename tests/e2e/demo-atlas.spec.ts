import { expect, test } from "@playwright/test";
import { clearAtlasLocalStorage } from "./fixtures/local-storage";

test.describe("demo Atlas guidee", () => {
  test.beforeEach(async ({ page }) => {
    await clearAtlasLocalStorage(page);
  });

  test("charge le scenario et permet de parcourir les etapes", async ({ page }) => {
    await page.goto("/demo-atlas");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Atlas transforme/i })).toBeVisible();
    await expect(page.getByText("Nova Services Maintenance").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Copier le r/i })).toBeVisible();

    const nextButton = page.getByRole("button", { name: /suivante/i });
    const previousButton = page.getByRole("button", { name: /dente/i });

    await expect(previousButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    await expect(page.getByRole("heading", { name: /Situation initiale/i })).toBeVisible();
    await expect(previousButton).toBeEnabled();

    await page.getByRole("button", { name: /4\./ }).click();
    await expect(page.getByRole("heading", { name: /donnees operationnelles/i })).toBeVisible();

    await page.getByRole("button", { name: /11\./ }).click();
    await expect(page.getByRole("heading", { name: /Valeur globale/i })).toBeVisible();
    await expect(nextButton).toBeDisabled();
    await expect(page.getByText(/Conclusion/i).first()).toBeVisible();
    await previousButton.click();
    await expect(nextButton).toBeEnabled();
  });
});
