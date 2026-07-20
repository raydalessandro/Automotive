import { test, expect } from "@playwright/test";

// Mock tracking: nessuna scrittura eventi reale.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/eventi", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
});

// Il progetto Playwright è "mobile" (Pixel 5): la nav desktop è nascosta e compare
// l'hamburger. La mappa apre, una voce naviga e il pannello si chiude.
test("mobile: la mappa apre, la voce naviga e si chiude", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#menu-mobile")).toHaveCount(0);

  const burger = page.getByRole("button", { name: "Apri il menu" });
  await expect(burger).toBeVisible();
  await burger.click();

  const menu = page.locator("#menu-mobile");
  await expect(menu).toBeVisible();
  // Mappa: gruppi e one-liner visibili.
  await expect(menu.getByText("Strumenti", { exact: true })).toBeVisible();
  await expect(menu.getByText("Il costo reale sul tuo regime fiscale")).toBeVisible();

  await menu.getByRole("link", { name: /Calcolatore/ }).click();
  await expect(page).toHaveURL(/\/calcolatore/);
  await expect(page.locator("#menu-mobile")).toHaveCount(0);
});

// Desktop: il dropdown "Per la tua attività" apre al click e naviga su /artigiani.
test("desktop: il dropdown apre e naviga su /artigiani", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: /Per la tua attività/ });
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("menuitem", { name: /Artigiani e installatori/ }).click();
  await expect(page).toHaveURL(/\/artigiani/);
  // Chiuso dopo la navigazione.
  await expect(page.getByRole("menu")).toHaveCount(0);
});
