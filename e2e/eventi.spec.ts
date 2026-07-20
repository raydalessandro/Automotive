import { test, expect, type Page } from "@playwright/test";

type EventoIntercettato = { tipo: string; dati?: Record<string, unknown> };

// Intercetta /api/eventi. Forza il fallback fetch (sendBeacon disabilitato) così
// l'intercettazione è affidabile in test. Con dnt: navigator.doNotTrack = "1".
async function preparaPagina(page: Page, opts: { dnt?: boolean } = {}): Promise<EventoIntercettato[]> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "sendBeacon", { value: undefined, configurable: true });
  });
  if (opts.dnt) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "doNotTrack", { get: () => "1", configurable: true });
    });
  }
  const eventi: EventoIntercettato[] = [];
  await page.route("**/api/eventi", async (route) => {
    try {
      eventi.push(JSON.parse(route.request().postData() || "{}"));
    } catch {
      /* body non json: ignora */
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  return eventi;
}

async function scrollaTutto(page: Page): Promise<void> {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 300) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(300);
}

function conta<T>(arr: T[], key: (t: T) => string | number): Map<string | number, number> {
  const m = new Map<string | number, number>();
  for (const a of arr) {
    const k = key(a);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

test("eventi: home — sezioni e scroll deduplicati, ogni evento ha env", async ({ page }) => {
  const eventi = await preparaPagina(page);
  await page.goto("/");
  await scrollaTutto(page);

  const sez = eventi.filter((e) => e.tipo === "sezione_vista");
  const perSezione = conta(sez, (e) => String(e.dati?.sezione));
  expect(perSezione.get("metodo")).toBe(1);
  expect(perSezione.get("faq")).toBe(1);
  for (const [, n] of perSezione) expect(n).toBe(1); // nessun duplicato

  const scroll = eventi.filter((e) => e.tipo === "scroll_soglia");
  const perSoglia = conta(scroll, (e) => Number(e.dati?.soglia));
  expect(perSoglia.get(25)).toBe(1);
  expect(perSoglia.get(50)).toBe(1);
  expect(perSoglia.get(75)).toBe(1);

  // Ogni evento intercettato porta dati.env (§0.2).
  expect(eventi.length).toBeGreaterThan(0);
  for (const e of eventi) expect(e.dati?.env).toBeTruthy();
});

test("eventi: back/forward e remount non duplicano sezione_vista", async ({ page }) => {
  const eventi = await preparaPagina(page);
  await page.goto("/");
  await scrollaTutto(page);
  const primo = eventi.filter((e) => e.tipo === "sezione_vista").length;
  expect(primo).toBeGreaterThan(0);

  await page.goto("/veicoli");
  await page.waitForLoadState("load");
  await page.goBack();
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { name: /Prima facciamo i conti/i })).toBeVisible();
  await scrollaTutto(page);
  const secondo = eventi.filter((e) => e.tipo === "sezione_vista").length;
  expect(secondo).toBe(primo); // dedup per sessione: nessun nuovo evento
});

test("eventi: click CTA hero → 1 cta_click con id giusto", async ({ page }) => {
  const eventi = await preparaPagina(page);
  await page.goto("/");
  await page.getByRole("link", { name: /Fai i conti con noi/i }).click();
  await page.waitForTimeout(300);

  const cta = eventi.filter((e) => e.tipo === "cta_click");
  expect(cta.filter((e) => e.dati?.cta === "hero_consulente")).toHaveLength(1);
});

test("eventi: focus sul form → 1 lead_iniziato, submit non duplica", async ({ page }) => {
  const eventi = await preparaPagina(page);
  // Mock del POST lead così il submit va a buon fine senza DB.
  await page.route("**/api/lead", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
  );
  await page.goto("/preventivo#form");

  // Primo focus su un campo → 1 evento lead_iniziato {form: preventivo}.
  await page.locator('input[name="ragione_sociale"]').click();
  await page.locator('input[name="referente"]').click(); // secondo focus: nessun duplicato
  await page.waitForTimeout(200);

  const iniziati = eventi.filter((e) => e.tipo === "lead_iniziato");
  expect(iniziati).toHaveLength(1);
  expect(iniziati[0].dati?.form).toBe("preventivo");

  // Compila e invia → nessun nuovo lead_iniziato.
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
  await page.waitForTimeout(300);

  expect(eventi.filter((e) => e.tipo === "lead_iniziato")).toHaveLength(1);
});

test("eventi: DNT attivo → zero richieste", async ({ page }) => {
  const eventi = await preparaPagina(page, { dnt: true });
  await page.goto("/");
  await scrollaTutto(page);
  await page
    .getByRole("link", { name: /Fai i conti con noi/i })
    .click()
    .catch(() => {});
  await page.waitForTimeout(300);
  expect(eventi.length).toBe(0);
});
