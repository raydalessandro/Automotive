import { ImageResponse } from "next/og";
import { articoloBySlug } from "@/lib/blog";
import { labelCategoria } from "@/lib/blog/schema";
import { SITE } from "@/lib/site";

// OG card 1200×630 per gli articoli (§1), stessa grammatica delle card veicolo.
// Runtime nodejs: legge il frontmatter dai file MDX su disco.
export const runtime = "nodejs";

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const a = articoloBySlug(params.slug);
  if (!a) return new Response("Not found", { status: 404 });

  const marchio = SITE.nome.toUpperCase().split(" ");

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#12100D",
            padding: "64px",
            color: "#F2EEE6",
            fontFamily: "Georgia, serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "2px solid #B08D4F",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B08D4F",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              IV
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "22px", letterSpacing: "6px" }}>
              <span>{marchio[0]}</span>
              <span style={{ color: "#B08D4F" }}>{marchio.slice(1).join(" ")}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "24px",
                letterSpacing: "4px",
                color: "#B08D4F",
                textTransform: "uppercase",
              }}
            >
              {labelCategoria(a.categoria)}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "60px",
                fontWeight: 600,
                lineHeight: 1.1,
                marginTop: "16px",
                maxWidth: "1000px",
              }}
            >
              {a.titolo}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ width: "10px", height: "10px", background: "#B08D4F", transform: "rotate(45deg)" }} />
            <span style={{ fontSize: "24px", color: "#F2EEE6", opacity: 0.7 }}>
              {`${a.minutiLettura} min di lettura · ${SITE.nomeBreve}`}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (e) {
    console.error("[og blog] render fallito:", (e as Error).message);
    return new Response("Errore generazione immagine", { status: 500 });
  }
}
