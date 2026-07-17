import type { MetadataRoute } from "next";
import { tuttiVeicoli } from "@/lib/catalogo";
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
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const veicoli = tuttiVeicoli().map((v) => ({
    url: `${base}/veicoli/${v.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...statiche, ...veicoli];
}
