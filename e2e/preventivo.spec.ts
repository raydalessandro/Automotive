import { test, expect } from "@playwright/test";

// Mock backend: nessuna scrittura DB, nessuna notifica reale.
test.beforeEach(async ({ page }) => {
  const ok = (route: import("@playwright/test").Route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  await page.route("**/api/lead", ok);
  await page.route("**/api/eventi", ok);
});

test("preventivo: i quattro canali sono presenti", async ({ page }) => {
  await page.goto("/preventivo");
  await expect(page.getByRole("link", { name: /Su WhatsApp/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Via email/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chiamaci ora/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Richiamami tu/i })).toBeVisible();
});

test("preventivo: il modal 'richiamami' invia nome + telefono", async ({ page }) => {
  await page.goto("/preventivo");
  await page.getByRole("button", { name: /Richiamami tu/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/Nome e cognome/i).fill("Mario Rossi");
  await dialog.getByLabel(/Telefono/i).fill("3331234567");
  await dialog.getByLabel(/informativa privacy/i).check();
  await dialog.getByRole("button", { name: /^Richiamami$/i }).click();

  await expect(page.getByText("Ricevuto.")).toBeVisible();
});
