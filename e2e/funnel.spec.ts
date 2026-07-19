import { test, expect } from "@playwright/test";

// Mock backend su ogni test: nessuna scrittura DB, nessuna notifica reale.
test.beforeEach(async ({ page }) => {
  const ok = (route: import("@playwright/test").Route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  await page.route("**/api/lead", ok);
  await page.route("**/api/eventi", ok);
});

test("funnel: home → scheda → configuratore → calcolatore → form inviato", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Home → scheda (prima card veicolo in evidenza)
  await page.locator('a[href^="/veicoli/"]').first().click();
  await expect(page).toHaveURL(/\/veicoli\/.+/);

  // Scheda → configuratore
  await page.getByRole("link", { name: /Configura la tua rata/i }).first().click();
  await expect(page).toHaveURL(/\/configuratore/);
  await expect(page.getByText(/Rata configurata/i)).toBeVisible();

  // Configuratore → calcolatore fiscale in coda
  await page.getByRole("button", { name: /Vedi il costo reale fiscale/i }).click();
  await expect(page.getByText("Il tuo costo reale", { exact: true })).toBeVisible();

  // Configuratore → form con configurazione allegata
  await page.getByRole("link", { name: /Richiedi il preventivo con questa configurazione/i }).click();
  await expect(page).toHaveURL(/\/preventivo/);
  await expect(page.getByText(/La tua configurazione/i)).toBeVisible();

  // Compila e invia
  await page.fill('input[name="ragione_sociale"]', "Test E2E SRL");
  await page.fill('input[name="referente"]', "Mario Test");
  await page.selectOption('select[name="forma_giuridica"]', "srl_spa");
  await page.selectOption('select[name="anni_attivita"]', "oltre_5");
  await page.selectOption('select[name="n_veicoli"]', "2_5");
  await page.selectOption('select[name="km_anno"]', "15_30");
  await page.fill('input[name="provincia"]', "MI");
  await page.fill('input[name="telefono"]', "3331234567");
  await page.check('input[name="consenso_privacy"]');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText("Ricevuto.")).toBeVisible();
});

test("landing di segmento caricano con H1", async ({ page }) => {
  for (const p of ["/agenti", "/artigiani", "/aziende"]) {
    await page.goto(p);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Configura la tua rata/i }).first()).toBeVisible();
  }
});

test("404 su rotta inesistente", async ({ page }) => {
  const res = await page.goto("/pagina-inesistente");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("404")).toBeVisible();
});
