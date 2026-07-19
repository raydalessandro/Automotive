"use client";

import { useEffect, useState } from "react";
import { traccia } from "@/lib/traccia";
import { whatsappLink, CONTATTI } from "@/lib/contatti";
import { SITE } from "@/lib/site";
import { titoliRischi, type Configurazione } from "@/lib/servizi.config";
import { numero } from "@/lib/format";
import { RichiamamiModal } from "./RichiamamiModal";

// Quattro canali per inviare la richiesta (§preventivo). WhatsApp/Email aprono il
// messaggio già pronto; "Chiamaci ora" è sempre presente (tel diretto); "Richiamami"
// apre un modal minimale (nome + telefono) → lead tracciato in dashboard.
const CONFIG_KEY = "impero_config";

function leggiConfig(): Configurazione | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as Configurazione) : null;
  } catch {
    return null;
  }
}

function costruisciMessaggio(veicoloTitolo?: string, config?: Configurazione | null): string {
  const righe = [`Ciao ${SITE.nomeBreve}! Vorrei un preventivo per il noleggio a lungo termine.`];
  if (veicoloTitolo) righe.push(`Veicolo: ${veicoloTitolo}`);
  if (config?.rata_configurata) {
    const extra = [
      config.durata ? `${config.durata} mesi` : null,
      config.km_anno ? `${numero(config.km_anno)} km/anno` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    righe.push(`Configurazione: ~€${numero(config.rata_configurata)}/mese${extra ? ` · ${extra}` : ""}`);
    if (config.servizi_scelti?.length) {
      righe.push(`Coperture: ${titoliRischi(config.servizi_scelti).join(", ")}`);
    }
  }
  righe.push("", "La mia attività: ");
  return righe.join("\n");
}

function Icona({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-oro" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Canale({
  href,
  onClick,
  target,
  icona,
  titolo,
  testo,
}: {
  href?: string;
  onClick?: () => void;
  target?: string;
  icona: React.ReactNode;
  titolo: string;
  testo: string;
}) {
  const classi =
    "group flex h-full flex-col items-start rounded-2xl border border-nero/10 bg-carta p-4 text-left transition-shadow hover:shadow-lg focus-visible:shadow-lg";
  const contenuto = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-oro/10">{icona}</span>
      <span className="mt-3 font-display text-base font-semibold group-hover:text-oro">{titolo}</span>
      <span className="mt-1 text-xs leading-snug text-testo-chiaro/60">{testo}</span>
    </>
  );
  return href ? (
    <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} onClick={onClick} className={classi}>
      {contenuto}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={classi}>
      {contenuto}
    </button>
  );
}

export function CanaliPreventivo({ veicoloTitolo, veicoloId }: { veicoloTitolo?: string; veicoloId?: string }) {
  const [config, setConfig] = useState<Configurazione | null>(null);
  const [modale, setModale] = useState(false);
  useEffect(() => setConfig(leggiConfig()), []);

  const messaggio = costruisciMessaggio(veicoloTitolo, config);
  const wa = whatsappLink(messaggio);
  const oggetto = `Richiesta preventivo${veicoloTitolo ? ` — ${veicoloTitolo}` : ""}`;
  const mailto = `mailto:${CONTATTI.email}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(messaggio)}`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Canale
          href={wa}
          target="_blank"
          onClick={() => traccia("whatsapp_click")}
          titolo="Su WhatsApp"
          testo="Messaggio già pronto: premi invia."
          icona={
            <Icona>
              <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" />
              <path d="M8.8 8.4c-.2 1 .2 2.2 1.3 3.4 1.1 1.1 2.3 1.6 3.4 1.3l1-.9c.2-.2.2-.4 0-.6l-1.2-.9c-.2-.1-.4-.1-.5 0l-.5.4c-.6-.3-1.2-.8-1.6-1.6l.4-.5c.1-.1.1-.4 0-.5l-.9-1.2c-.2-.2-.4-.2-.6 0Z" />
            </Icona>
          }
        />
        <Canale
          href={mailto}
          titolo="Via email"
          testo="La mail col testo compilato."
          icona={
            <Icona>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </Icona>
          }
        />
        <Canale
          href={`tel:${CONTATTI.telefonoHref}`}
          titolo="Chiamaci ora"
          testo="Parla subito con noi."
          icona={
            <Icona>
              <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V17a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z" />
            </Icona>
          }
        />
        <Canale
          onClick={() => setModale(true)}
          titolo="Richiamami tu"
          testo="Lascia nome e numero, chiamiamo noi."
          icona={
            <Icona>
              <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V17a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              <path d="M15 3h6m0 0v6m0-6-7 7" />
            </Icona>
          }
        />
      </div>

      <RichiamamiModal aperto={modale} onClose={() => setModale(false)} veicoloId={veicoloId} config={config} />
    </>
  );
}
