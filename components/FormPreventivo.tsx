"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FORME_GIURIDICHE,
  ANNI_ATTIVITA,
  SETTORI,
  N_VEICOLI,
  KM_ANNO,
} from "@/lib/lead/schema";

type Fonte = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
};

const UTM_KEY = "impero_utm";

function leggiFonte(): Fonte {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Fonte) : {};
  } catch {
    return {};
  }
}

export function FormPreventivo({ veicoloId, veicoloTitolo }: { veicoloId?: string; veicoloTitolo?: string }) {
  const tsApertura = useRef<number>(0);
  const [stato, setStato] = useState<"idle" | "invio" | "ok" | "errore">("idle");
  const [erroriCampo, setErroriCampo] = useState<Record<string, string[]>>({});

  useEffect(() => {
    tsApertura.current = Date.now();
  }, []);

  const fonte = useMemo(leggiFonte, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("invio");
    setErroriCampo({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      ragione_sociale: String(fd.get("ragione_sociale") ?? ""),
      referente: String(fd.get("referente") ?? ""),
      forma_giuridica: String(fd.get("forma_giuridica") ?? ""),
      anni_attivita: String(fd.get("anni_attivita") ?? ""),
      settore: String(fd.get("settore") ?? ""),
      n_veicoli: String(fd.get("n_veicoli") ?? ""),
      km_anno: String(fd.get("km_anno") ?? ""),
      veicolo_id: String(fd.get("veicolo_id") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
      email: String(fd.get("email") ?? ""),
      provincia: String(fd.get("provincia") ?? ""),
      consenso_privacy: fd.get("consenso_privacy") === "on",
      consenso_marketing: fd.get("consenso_marketing") === "on",
      hp: String(fd.get("hp") ?? ""),
      ts_apertura: tsApertura.current,
      fonte,
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
        setStato("ok");
      } else {
        setErroriCampo(data.dettagli ?? {});
        setStato("errore");
      }
    } catch {
      setStato("errore");
    }
  }

  if (stato === "ok") {
    return (
      <div className="rounded-2xl border border-oro/30 bg-oro/10 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold">Ricevuto.</h2>
        <p className="mt-2 text-testo-chiaro/70">Ti richiamiamo entro poche ore lavorative.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-nero/10 bg-carta p-6 sm:p-8" noValidate>
      {veicoloTitolo && (
        <p className="mb-6 rounded-lg bg-avorio px-4 py-3 text-sm">
          Richiesta per: <strong>{veicoloTitolo}</strong>
        </p>
      )}

      {/* Honeypot antispam — nascosto agli umani. */}
      <input
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0"
      />
      <input type="hidden" name="veicolo_id" defaultValue={veicoloId ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nome attività / ragione sociale" name="ragione_sociale" errori={erroriCampo} required />
        <Campo label="Nome e cognome referente" name="referente" errori={erroriCampo} required />
        <SelectCampo label="Forma giuridica" name="forma_giuridica" opzioni={FORME_GIURIDICHE} errori={erroriCampo} required />
        <SelectCampo label="Anni di attività" name="anni_attivita" opzioni={ANNI_ATTIVITA} errori={erroriCampo} required />
        <SelectCampo label="Settore" name="settore" opzioni={SETTORI} errori={erroriCampo} placeholder="Facoltativo" />
        <SelectCampo label="Quanti veicoli ti servono" name="n_veicoli" opzioni={N_VEICOLI} errori={erroriCampo} required />
        <SelectCampo label="Km all'anno stimati" name="km_anno" opzioni={KM_ANNO} errori={erroriCampo} required />
        <Campo label="Provincia" name="provincia" errori={erroriCampo} required />
        <Campo label="Telefono" name="telefono" type="tel" errori={erroriCampo} required />
        <Campo label="Email" name="email" type="email" errori={erroriCampo} placeholder="Facoltativa" />
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consenso_privacy" required className="mt-1 accent-oro" />
          <span>
            Ho letto l'
            <a href="/privacy" className="text-oro underline" target="_blank">
              informativa privacy
            </a>{" "}
            e acconsento al trattamento dei dati per essere ricontattato. *
          </span>
        </label>
        {erroriCampo.consenso_privacy && (
          <p className="text-xs text-red-600">{erroriCampo.consenso_privacy[0]}</p>
        )}
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consenso_marketing" className="mt-1 accent-oro" />
          <span className="text-testo-chiaro/70">
            Acconsento a ricevere comunicazioni commerciali (facoltativo).
          </span>
        </label>
      </div>

      {stato === "errore" && Object.keys(erroriCampo).length === 0 && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Qualcosa è andato storto. Riprova o chiamaci direttamente.
        </p>
      )}

      <button type="submit" disabled={stato === "invio"} className="btn-oro mt-6 w-full disabled:opacity-60">
        {stato === "invio" ? "Invio in corso…" : "Richiedi il preventivo"}
      </button>
      <p className="mt-3 text-center text-xs text-testo-chiaro/45">
        Ti richiamiamo entro poche ore lavorative. Nessun impegno.
      </p>
    </form>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  errori,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  errori: Record<string, string[]>;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-oro">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2.5 focus:border-oro focus:outline-none"
      />
      {errori[name] && <span className="mt-1 block text-xs text-red-600">{errori[name][0]}</span>}
    </label>
  );
}

function SelectCampo({
  label,
  name,
  opzioni,
  required = false,
  placeholder = "Seleziona…",
  errori,
}: {
  label: string;
  name: string;
  opzioni: readonly { id: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  errori: Record<string, string[]>;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-oro">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-nero/15 bg-carta px-3 py-2.5 focus:border-oro focus:outline-none"
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {opzioni.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {errori[name] && <span className="mt-1 block text-xs text-red-600">{errori[name][0]}</span>}
    </label>
  );
}
