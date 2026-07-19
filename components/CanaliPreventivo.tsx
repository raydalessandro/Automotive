"use client";

import { useEffect, useState } from "react";
import { traccia } from "@/lib/traccia";
import { whatsappLink, CONTATTI } from "@/lib/contatti";
import { SITE } from "@/lib/site";
import { titoliRischi, type Configurazione } from "@/lib/servizi.config";
import { numero } from "@/lib/format";

// Tre canali per inviare la richiesta (§preventivo). WhatsApp ed Email aprono il
// messaggio già pronto (l'utente preme solo invia); il form è il canale tracciato
// che arriva in dashboard. Riusa la configurazione dal configuratore se presente.
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
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-oro" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  href: string;
  onClick?: () => void;
  target?: string;
  icona: React.ReactNode;
  titolo: string;
  testo: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-nero/10 bg-carta p-5 transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-oro/10">{icona}</span>
      <span className="mt-4 font-display text-lg font-semibold group-hover:text-oro">{titolo}</span>
      <span className="mt-1 text-sm text-testo-chiaro/65">{testo}</span>
    </a>
  );
}

export function CanaliPreventivo({ veicoloTitolo }: { veicoloTitolo?: string }) {
  const [config, setConfig] = useState<Configurazione | null>(null);
  useEffect(() => setConfig(leggiConfig()), []);

  const messaggio = costruisciMessaggio(veicoloTitolo, config);
  const wa = whatsappLink(messaggio);
  const oggetto = `Richiesta preventivo${veicoloTitolo ? ` — ${veicoloTitolo}` : ""}`;
  const mailto = `mailto:${CONTATTI.email}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(messaggio)}`;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Canale
        href={wa}
        target="_blank"
        onClick={() => traccia("whatsapp_click")}
        titolo="Su WhatsApp"
        testo="Ti apriamo il messaggio già pronto: premi invia e ci arriva."
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
        testo="Apre la mail con il testo compilato: aggiungi i tuoi dati e invia."
        icona={
          <Icona>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </Icona>
        }
      />
      <Canale
        href="#form"
        titolo="Compila il form"
        testo="Ti ricontattiamo noi con la proposta, entro 24 ore lavorative."
        icona={
          <Icona>
            <path d="M6 3h9l3 3v15H6z" />
            <path d="M9 12h6M9 16h6M9 8h3" />
          </Icona>
        }
      />
    </div>
  );
}
