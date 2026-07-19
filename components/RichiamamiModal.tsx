"use client";

import { useEffect, useRef, useState } from "react";
import { traccia } from "@/lib/traccia";
import type { Configurazione } from "@/lib/servizi.config";

// Modal "richiamami tu" — attrito minimo per il lead caldo: nome + telefono e
// basta. Crea un lead vero (dashboard + notifica) con i campi aziendali a default
// neutri e una nota "Richiamo rapido" così il team sa che vanno raccolti in chiamata.
// Riusa la configurazione dal configuratore se presente.
export function RichiamamiModal({
  aperto,
  onClose,
  veicoloId,
  config,
}: {
  aperto: boolean;
  onClose: () => void;
  veicoloId?: string;
  config: Configurazione | null;
}) {
  const [stato, setStato] = useState<"idle" | "invio" | "ok" | "errore">("idle");
  const primo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aperto) return;
    setStato("idle");
    primo.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aperto, onClose]);

  if (!aperto) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("invio");
    const fd = new FormData(e.currentTarget);
    const nome = String(fd.get("nome") ?? "").trim();
    const telefono = String(fd.get("telefono") ?? "").trim();

    const payload = {
      ragione_sociale: nome,
      referente: nome,
      // Campi aziendali non richiesti nel richiamo rapido: default neutri, flaggati dalla nota.
      forma_giuridica: "altro",
      anni_attivita: "1_2",
      n_veicoli: "1",
      km_anno: "15_30",
      provincia: "—",
      telefono,
      consenso_privacy: fd.get("consenso_privacy") === "on",
      veicolo_id: veicoloId ?? config?.veicolo_id ?? "",
      configurazione: config,
      note: "⚡ Richiamo rapido dal sito — dati aziendali da raccogliere in chiamata.",
      pagina: typeof window !== "undefined" ? window.location.pathname : "",
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        traccia("preventivo_inviato", { veicolo_id: veicoloId });
        setStato("ok");
      } else {
        setStato("errore");
      }
    } catch {
      setStato("errore");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="richiamami-titolo"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 bg-nero/60"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-carta p-6 shadow-xl sm:p-8">
        {stato === "ok" ? (
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold">Ricevuto.</h2>
            <p className="mt-2 text-testo-chiaro/70">Ti richiamiamo noi, a breve.</p>
            <button type="button" onClick={onClose} className="btn-oro mt-6">
              Chiudi
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="text-xs font-semibold uppercase tracking-widest text-oro">Richiamami tu</p>
            <h2 id="richiamami-titolo" className="mt-1 font-display text-2xl font-semibold">
              Lasciaci nome e numero
            </h2>
            <p className="mt-2 text-sm text-testo-chiaro/65">
              Ti richiamiamo noi con la proposta. Niente form lungo: solo l&apos;essenziale.
            </p>

            <label className="mt-5 block text-sm">
              <span className="font-medium">
                Nome e cognome <span className="text-oro">*</span>
              </span>
              <input
                ref={primo}
                name="nome"
                required
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2.5 focus:border-oro focus:outline-none"
              />
            </label>

            <label className="mt-4 block text-sm">
              <span className="font-medium">
                Telefono <span className="text-oro">*</span>
              </span>
              <input
                name="telefono"
                type="tel"
                required
                autoComplete="tel"
                className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2.5 focus:border-oro focus:outline-none"
              />
              <span className="mt-1 block text-xs text-testo-chiaro/50">
                Lo usiamo solo per richiamarti col preventivo.
              </span>
            </label>

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" name="consenso_privacy" required className="mt-1 accent-oro" />
              <span>
                Ho letto l&apos;
                <a href="/privacy" className="text-oro underline" target="_blank">
                  informativa privacy
                </a>{" "}
                e acconsento al trattamento dei dati per essere ricontattato. *
              </span>
            </label>

            {stato === "errore" && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Qualcosa è andato storto. Riprova o chiamaci direttamente.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                Annulla
              </button>
              <button type="submit" disabled={stato === "invio"} className="btn-oro flex-1 disabled:opacity-60">
                {stato === "invio" ? "Invio…" : "Richiamami"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
