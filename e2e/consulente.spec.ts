import { test, expect } from "@playwright/test";

// Mock tracking: nessuna scrittura eventi reale.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/eventi", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
});

test("consulente: 5 risposte → soluzioni → configura (senza lasciare contatti)", async ({ page }) => {
  await page.goto("/consulente");
  await expect(page.getByText("Che attività fai?")).toBeVisible();

  // Le 5 risposte (selezionare avanza).
  await page.locator('input[name="attivita"][value="artigiano"]').click();
  await page.locator('input[name="km"][value="20_30"]').click();
  await page.locator('input[name="trasporto"][value="spesso"]').click();
  await page.locator('input[name="forfettario"][value="no"]').click();
  await page.locator('input[name="priorita"][value="fiscale"]').click();

  // Soluzioni visibili senza alcun form di contatto.
  await expect(page.getByRole("heading", { name: "Le tue soluzioni" })).toBeVisible();
  await expect(page.getByText("La nostra proposta")).toBeVisible();

  // "Configura questa" → configuratore preimpostato.
  await page.getByRole("link", { name: "Configura questa" }).first().click();
  await expect(page).toHaveURL(/\/configuratore\?.*veicolo=/);
});

test("consulente: oltre 30.000 km → pannello su misura, niente card", async ({ page }) => {
  await page.goto("/consulente");
  await page.locator('input[name="attivita"][value="agente"]').click();
  await page.locator('input[name="km"][value="oltre_30"]').click();
  await page.locator('input[name="trasporto"][value="no"]').click();
  await page.locator('input[name="forfettario"][value="no"]').click();
  await page.locator('input[name="priorita"][value="rata"]').click();

  await expect(page.getByText(/Oltre i 30.000 km/i)).toBeVisible();
  await expect(page.getByText("La nostra proposta")).toHaveCount(0);
});

test("consulente: ?attivita= dalla landing salta la prima domanda", async ({ page }) => {
  await page.goto("/consulente?attivita=agente");
  await expect(page.getByText("Quanti km fai in un anno?")).toBeVisible();
});
