# Sito con gli asset dentro — cosa è stato fatto

Branch di anteprima del sito Impero con il materiale del catalogo già montato. Non è la versione finale:
è una **base di lavoro molto più avanzata** da cui partire. Il catalogo (la zip) resta il riferimento completo;
questo è il catalogo *applicato* al sito reale, così si vede tutto vivo prima di decidere.

## In sintesi

Interventi **chirurgici e retrocompatibili**: nessuna logica toccata (lead, dashboard, API, blog, tracking, fisco
restano identici), nessuna dipendenza nuova, palette e componenti esistenti rispettati. Solo il livello visivo.
Build, typecheck e lint passano puliti.

## Cosa è cambiato, pagina per pagina

### Homepage (`app/(public)/page.tsx`)
- **Hero con fotografia**: la colonna destra (prima una lista di bullet) ora ospita `foto-hero.webp` —
  l'imprenditore col suo mezzo. La firma `LineaVeicoli` resta sotto. La CTA oro rimane l'unico elemento oro-pieno
  (principio di isolamento: la CTA converte per contrasto).
- **Micro-garanzie sotto la CTA**: "Preventivo gratuito · Dati protetti · Risposta in 48h", con micro-icone.
  I trust signal vicino al punto di decisione danno uplift (Baymard), non nel footer.
- **Nuova sezione emotiva "Non compri un'auto, compri il non doverci più pensare"** con `foto-tranquillita.webp`,
  prima della CTA finale. È il filo emotivo del brand (si compra il non-pensiero), quasi sempre assente nel B2B.
- **CTA finale con sfondo materico**: `foto-sfondo.webp` scura in overlay, per dare profondità al blocco di chiusura.

### Landing di segmento (`agenti`, `artigiani`, `aziende` + `components/LandingSegmento.tsx`)
- Aggiunto al componente un prop **opzionale** `foto` (retrocompatibile): se presente, mostra una fascia visual
  panoramica sotto l'hero. Ogni segmento ha la sua foto dedicata:
  - `/agenti` → `foto-agente.webp` (professionista in mobilità)
  - `/artigiani` → `foto-artigiano.webp` (furgone davanti al laboratorio)
  - `/aziende` → `foto-flotta.webp` (la piccola flotta)

### Chi siamo (`app/(public)/chi-siamo/page.tsx`)
- **Immagine istituzionale** `foto-studio.webp` in apertura: l'insight di brand più importante — la sensazione di
  uno studio di consulenza, non di una concessionaria.
- **Blocco "un unico interlocutore"** con `foto-consulenza.webp`: la relazione 1:1, il consulente dedicato.
- Tutti i testi esistenti preservati, solo riorganizzati attorno alle immagini.

### Form preventivo (`components/FormPreventivo.tsx`)
- Aggiunto un prop **opzionale** `aiuto` al campo (retrocompatibile) e usato sul telefono:
  "Ci serve solo per richiamarti col preventivo". Spiegare *perché* si chiede un dato sensibile aumenta il
  completamento del form (NN/G). Nessuna modifica alla validazione o all'invio.

## Le foto

Le 10 foto editoriali sono in `public/foto/` (WebP, servite con `next/image`, lazy-load automatico, `sizes`
responsive). Convenzione `/foto/<nome>.webp`, separata da `public/img/veicoli/` (riservata alle foto dei veicoli).

## Dove NON sono intervenuto (di proposito)

- Logica di business, dashboard, API, Supabase, email, tracking, motore blog: intatti.
- Routing e struttura dati: invariati.
- Componenti esistenti: solo estensioni retrocompatibili (prop opzionali), nessun contratto rotto.
- Gli asset SVG del catalogo (icone, componenti, blocchi): **non** li ho forzati nel sito. Il sito ha già il suo
  linguaggio vettoriale (`LineaVeicoli`, `FasciaServizi`, icone servizi) coerente col catalogo. Ho aggiunto ciò che
  davvero mancava — la fotografia — lasciando al designer la scelta se e dove integrare altri SVG del catalogo.

## Verifica fatta

- `npx next build` → completo, tutte le pagine compilate e prerenderizzate.
- `npx tsc --noEmit` → pulito.
- `npx next lint` → nessun warning/errore.
- Server di produzione + controllo caricamento immagini → tutte OK (home 6/6, chi-siamo 2/2, agenti 3/3).

## Da qui in poi (per il designer)

Questa è una base, non un punto d'arrivo. Spunti dove il valore di un occhio esperto fa la differenza:
- Rifinire crop e posizione delle foto nei vari breakpoint (le proporzioni sono impostate, l'arte no).
- Valutare se portare altri asset del catalogo (badge, ribbon, blocchi come banner-fiscale/tabella-confronto)
  nelle pagine dove aiutano la conversione.
- Sostituire i placeholder residui (numeri d'esempio, testi "in aggiornamento" di chi-siamo).
- Le note strategiche complete (perché certe scelte) sono in `NOTE-STRATEGICHE-DESIGN.md` nel catalogo.
