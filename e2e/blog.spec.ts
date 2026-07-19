import { test, expect } from "@playwright/test";

// Mock tracking: nessuna scrittura eventi reale.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/eventi", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
});

const PUBBLICATO = "costi-nascosti-noleggio-lungo-termine";
const BOZZA = "noleggio-lungo-termine-partita-iva-cosa-scarichi";

test("blog: indice mostra i pubblicati e non le bozze", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(`a[href="/blog/${PUBBLICATO}"]`).first()).toBeVisible();
  await expect(page.locator(`a[href="/blog/${BOZZA}"]`)).toHaveCount(0);
});

test("blog: articolo → CTA porta allo strumento del frontmatter", async ({ page }) => {
  await page.goto(`/blog/${PUBBLICATO}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Unico H1.
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  // CTA pilotata dal frontmatter (cta: configuratore).
  const cta = page.getByRole("link", { name: /Apri il configuratore/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/configuratore/);
});

test("blog: la bozza non è raggiungibile (404)", async ({ page }) => {
  const res = await page.goto(`/blog/${BOZZA}`);
  expect(res?.status()).toBe(404);
});

test("blog: RSS valido con solo articoli pubblicati", async ({ page }) => {
  const res = await page.goto("/blog/rss.xml");
  expect(res?.status()).toBe(200);
  const body = (await res?.text()) ?? "";
  expect(body).toContain("<rss");
  expect(body).toContain(`/blog/${PUBBLICATO}`);
  expect(body).not.toContain(`/blog/${BOZZA}`);
});
