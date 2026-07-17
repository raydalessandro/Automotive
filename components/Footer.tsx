import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { SITE } from "@/lib/site";
import { CONTATTI } from "@/lib/contatti";

const COLONNE = [
  {
    titolo: "Noleggio",
    voci: [
      { href: "/veicoli", label: "Tutti i veicoli" },
      { href: "/calcolatore", label: "Calcola il costo reale" },
      { href: "/preventivo", label: "Richiedi un preventivo" },
    ],
  },
  {
    titolo: "Per chi",
    voci: [
      { href: "/agenti", label: "Agenti e rappresentanti" },
      { href: "/artigiani", label: "Artigiani e installatori" },
      { href: "/aziende", label: "Aziende e flotte" },
    ],
  },
  {
    titolo: "Impero",
    voci: [
      { href: "/chi-siamo", label: "Chi siamo" },
      { href: "/contatti", label: "Contatti" },
      { href: "/note-legali", label: "Note legali" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-nero text-testo-scuro">
      <div className="container-content grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Wordmark scuro />
          <p className="mt-4 max-w-xs text-sm text-testo-scuro/70">{SITE.descrizione}</p>
          <div className="mt-4 space-y-1 text-sm text-testo-scuro/70">
            <p>
              <a href={`tel:${CONTATTI.telefonoHref}`} className="hover:text-oro-chiaro">
                {CONTATTI.telefono}
              </a>
            </p>
            <p>
              <a href={`mailto:${CONTATTI.email}`} className="hover:text-oro-chiaro">
                {CONTATTI.email}
              </a>
            </p>
          </div>
        </div>
        {COLONNE.map((c) => (
          <nav key={c.titolo} aria-label={c.titolo}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-oro">
              {c.titolo}
            </h2>
            <ul className="mt-4 space-y-2">
              {c.voci.map((v) => (
                <li key={v.href}>
                  <Link
                    href={v.href}
                    className="text-sm text-testo-scuro/75 transition-colors hover:text-oro-chiaro"
                  >
                    {v.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-testo-scuro/10">
        <div className="container-content flex flex-col gap-2 py-6 text-xs text-testo-scuro/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE.footerLegale}</p>
          <p>
            © {SITE.nome} · <Link href="/cookie" className="hover:text-oro-chiaro">Cookie</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
