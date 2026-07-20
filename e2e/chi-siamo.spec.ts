import { test, expect } from "@playwright/test";

test("chi-siamo: H1 e tre card persone", async ({ page }) => {
  await page.goto("/chi-siamo");
  await expect(
    page.getByRole("heading", { level: 1, name: /Chi risponde quando chiedi un preventivo/i }),
  ).toBeVisible();

  // Le tre persone, card identiche.
  for (const nome of ["Shery", "Ahmed", "Alessio"]) {
    await expect(page.getByRole("heading", { name: nome, exact: true })).toBeVisible();
  }

  // Il metodo linka gli strumenti.
  await expect(page.getByRole("link", { name: /Fai i conti/i }).first()).toBeVisible();
});

test("chi-siamo: la card richiamo nomina Shery e Ahmed", async ({ page }) => {
  await page.goto("/preventivo");
  await expect(page.getByText(/Ti richiama Shery o Ahmed/i)).toBeVisible();
});
