import type { Metadata } from "next";
import { CONTATTI, whatsappLink } from "@/lib/contatti";
import { LinkTracciato } from "@/components/traccia/LinkTracciato";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatta Impero Automotive: telefono, WhatsApp ed email per il tuo preventivo di noleggio a lungo termine.",
};

export default function ContattiPage() {
  return (
    <div className="container-content py-12 sm:py-16">
      <h1 className="font-display text-4xl font-semibold">Contatti</h1>
      <p className="mt-3 max-w-xl text-testo-chiaro/65">
        Siamo a disposizione per un preventivo o per qualsiasi domanda sul noleggio a lungo termine.
      </p>

      {/* [APERTO §11: numeri e orari definitivi] */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <LinkTracciato
          tipo="telefono_click"
          href={`tel:${CONTATTI.telefonoHref}`}
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Telefono</p>
          <p className="mt-2 font-display text-xl font-semibold">{CONTATTI.telefono}</p>
        </LinkTracciato>
        <LinkTracciato
          tipo="whatsapp_click"
          href={whatsappLink("Ciao, vorrei informazioni sul noleggio a lungo termine.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">WhatsApp</p>
          <p className="mt-2 font-display text-xl font-semibold">Scrivici su WhatsApp</p>
        </LinkTracciato>
        <a
          href={`mailto:${CONTATTI.email}`}
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Email</p>
          <p className="mt-2 font-display text-xl font-semibold break-all">{CONTATTI.email}</p>
        </a>
      </div>

      <p className="mt-8 text-sm text-testo-chiaro/60">Orari: {CONTATTI.orari}</p>
    </div>
  );
}
