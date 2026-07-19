import { articoliPubblicati } from "@/lib/blog";
import { labelCategoria } from "@/lib/blog/schema";
import { SITE, siteUrl } from "@/lib/site";

// Feed RSS 2.0 (§1). Solo articoli pubblicati; le bozze non escono mai.
export const dynamic = "force-static";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const base = siteUrl();
  const articoli = articoliPubblicati();

  const items = articoli
    .map((a) => {
      const url = `${base}/blog/${a.slug}`;
      const data = new Date(`${a.data}T12:00:00Z`).toUTCString();
      return `    <item>
      <title>${esc(a.titolo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${data}</pubDate>
      <category>${esc(labelCategoria(a.categoria))}</category>
      <description>${esc(a.descrizione)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE.nome)} — Blog</title>
    <link>${base}/blog</link>
    <description>${esc(SITE.descrizione)}</description>
    <language>it-IT</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
