import { test, expect } from "@playwright/test";

// Mock tracking: nessuna scrittura eventi reale.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/eventi", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
});

// Il progetto Playwright è "mobile" (Pixel 5): la nav desktop è nascosta e deve
// comparire l'hamburger.
test("mobile: hamburger apre il menu, la voce naviga e il menu si chiude", async ({ page }) => {
  await page.goto("/");

  // Il pannello non è ancora aperto.
  await expect(page.locator("#menu-mobile")).toHaveCount(0);

  // Apri l'hamburger.
  const burger = page.getByRole("button", { name: "Apri il menu" });
  await expect(burger).toBeVisible();
  await burger.click();

  const menu = page.locator("#menu-mobile");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Blog" })).toBeVisible();

  // Naviga su una voce → il menu si chiude e la pagina cambia.
  await menu.getByRole("link", { name: "Calcolatore" }).click();
  await expect(page).toHaveURL(/\/calcolatore/);
  await expect(page.locator("#menu-mobile")).toHaveCount(0);
});
