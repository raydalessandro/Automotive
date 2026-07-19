import { ImageResponse } from "next/og";
import { veicoloById, kmAnno } from "@/lib/catalogo";
import { euro, numero } from "@/lib/format";
import { SITE } from "@/lib/site";

export const runtime = "edge";

// OG card 1200×630 in stile Impero (§7). Sostituisce le locandine del fornitore.
export function GET(_req: Request, { params }: { params: { id: string } }) {
  const v = veicoloById(params.id);
  if (!v) {
    return new Response("Not found", { status: 404 });
  }

  const anticipo = v.anticipo_iva_esclusa === 0 ? "Anticipo zero" : `Anticipo ${euro(v.anticipo_iva_esclusa)}`;

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
          <div style={{ display: "flex", gap: "8px", fontSize: "22px", letterSpacing: "6px", color: "#F2EEE6" }}>
            <span>{SITE.nome.toUpperCase().split(" ")[0]}</span>
            <span style={{ color: "#B08D4F" }}>
              {SITE.nome.toUpperCase().split(" ").slice(1).join(" ")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "24px", letterSpacing: "4px", color: "#B08D4F", textTransform: "uppercase" }}>
            {v.marca}
          </div>
          <div style={{ fontSize: "68px", fontWeight: 600, lineHeight: 1.05, marginTop: "8px" }}>
            {v.modello}
          </div>
          <div style={{ fontSize: "30px", color: "#F2EEE6", opacity: 0.7, marginTop: "6px" }}>
            {v.versione}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "22px", color: "#F2EEE6", opacity: 0.6 }}>da</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "84px", fontWeight: 700, color: "#D6BC8A" }}>
                {euro(v.canone_mese_iva_esclusa)}
              </span>
              <span style={{ fontSize: "30px", color: "#F2EEE6", opacity: 0.7 }}>/mese + IVA</span>
            </div>
            <div style={{ fontSize: "22px", color: "#F2EEE6", opacity: 0.55, marginTop: "4px" }}>
              Tutti i servizi inclusi
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              textAlign: "right",
              fontSize: "24px",
              color: "#F2EEE6",
              opacity: 0.85,
            }}
          >
            <div>{`${v.durata_mesi} mesi`}</div>
            <div>{`${numero(kmAnno(v))} km/anno`}</div>
            <div style={{ color: "#B08D4F" }}>{anticipo}</div>
          </div>
        </div>
      </div>
    ),
      { width: 1200, height: 630 },
    );
  } catch (e) {
    console.error("[og] render fallito:", (e as Error).message);
    return new Response("Errore generazione immagine", { status: 500 });
  }
}
