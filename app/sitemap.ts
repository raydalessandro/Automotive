import type { MetadataRoute } from "next";
import { tuttiVeicoli } from "@/lib/catalogo";
import { articoliPubblicati, categorieConArticoli } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const statiche = [
    "",
    "/veicoli",
    "/calcolatore",
    "/preventivo",
    "/agenti",
    "/artigiani",
    "/aziende",
    "/chi-siamo",
    "/contatti",
    "/blog",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const veicoli = tuttiVeicoli().map((v) => ({
    url: `${base}/veicoli/${v.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Solo articoli pubblicati e categorie non vuote: le bozze restano fuori dalla sitemap.
  const articoli = articoliPubblicati().map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.aggiornato_il ?? a.data,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const categorie = categorieConArticoli().map((c) => ({
    url: `${base}/blog/categoria/${c.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...statiche, ...veicoli, ...articoli, ...categorie];
}
