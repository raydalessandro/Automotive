import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { TEAM } from "@/lib/team";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: `${SITE.nome}: noleggio, vendita e acquisto di auto, moto e veicoli commerciali per partite IVA e aziende.`,
};

export default function ChiSiamoPage() {
  return (
    <>
      {/* Immagine istituzionale: la promessa di uno studio di consulenza */}
      <section className="bg-nero">
        <div className="container-content pt-10">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src="/foto/foto-studio.webp"
              alt="Interno di uno studio di consulenza"
              fill
              priority
              sizes="(min-width: 1024px) 68rem, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nero/50 to-transparent" />
          </div>
        </div>
      </section>

      <div className="container-content py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-semibold">Chi siamo</h1>

          {/* TODO §11: testi definitivi dal cliente (storia, affidabilità). */}
          <div className="mt-6 space-y-4 text-testo-chiaro/75">
            <p>
              {SITE.nome} accompagna partite IVA e aziende nella scelta del veicolo giusto in
              noleggio a lungo termine: un'unica rata mensile con tutti i servizi inclusi, senza
              capitale immobilizzato e senza pensieri di gestione.
            </p>
            <p>
              Ci occupiamo di noleggio, vendita e acquisto di auto, moto e veicoli commerciali,
              costruendo per ogni cliente la formula più efficiente in base alla sua forma giuridica e
              al suo utilizzo.
            </p>
          </div>

          {/* La relazione 1:1, con il visual della consulenza dedicata */}
          <div className="mt-10 grid items-center gap-8 rounded-2xl border border-nero/10 bg-carta p-6 sm:grid-cols-2 sm:p-8">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
              <Image
                src="/foto/foto-consulenza.webp"
                alt="Consulente e cliente esaminano una proposta"
                fill
                sizes="(min-width: 640px) 30rem, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Un unico interlocutore</h2>
              <p className="mt-3 text-testo-chiaro/75">
                Lavoriamo sui listini dei principali operatori di noleggio a lungo termine:
                confrontiamo le proposte e portiamo al cliente quella più adatta, con una consulenza
                dedicata dall'inizio alla consegna.
              </p>
            </div>
          </div>

          {/* Il team — un volto alla consulenza (§11). Foto di Ahmed e Shery provvisorie. */}
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold">Le persone</h2>
            <p className="mt-2 text-testo-chiaro/70">
              Un nome e un volto: con noi parli sempre con una persona, non con un portale.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {TEAM.map((c) => (
                <div key={c.nome} className="overflow-hidden rounded-2xl border border-nero/10 bg-carta">
                  <div className="relative aspect-[4/5] bg-avorio">
                    <Image
                      src={c.foto}
                      alt={c.nome}
                      fill
                      sizes="(min-width: 640px) 15rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold leading-tight">{c.nome}</h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-oro">
                      {c.ruolo}
                    </p>
                    <p className="mt-2 text-sm text-testo-chiaro/70">{c.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12">
            <Link href="/preventivo" className="btn-oro">
              Richiedi il preventivo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
