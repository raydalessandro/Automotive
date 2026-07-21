# Spec-seme — App venditori dedicata (v3, visione)

> Cattura della visione dell'operatore (mar 21/7). Non è una consegna: si lavora DOPO,
> quando il flusso base avrà girato. Da committare insieme alla consegna PR-6 così resta
> nel metodo: prima la spec, poi il codice. La `/vendita` attuale resta com'è nel frattempo.

## Principio

Scaricare completamente i venditori dal sistema: un'app **solo loro**, finalizzata alla
vendita. Niente casa base, niente magazzino, niente analytics. Dentro: le pratiche, la
comunicazione con l'operatore, la formazione. Tutto il resto sparisce.

## Perché è già possibile

L'app parla **direttamente col DB**: la RLS della migration 011 è stata verificata dal
vivo (il venditore vede zero righe non sue, non può scriverne nemmeno una) e vale anche
per **Supabase Realtime** — il "live tramite DB": l'assegnazione compare sul telefono in
tempo reale, senza refresh, sottoscrivendo i lead con `assegnato_a = auth.uid()`.
Stessa auth, stesse policy, zero backend nuovo.

## Moduli (in ordine di arrivo)

1. **Pratiche** — l'attuale flusso (`prendi in carico` → esiti + nota), con il brief
   arricchito quando i dati aziendali cresceranno. Realtime sulle assegnazioni.
2. **Filo diretto** — commenti per-pratica tra operatore e venditore, nel momento in cui
   le pratiche si passano e si trasformano. Tabella `lead_commenti`
   (lead_id, autore, testo, ts) con RLS sulla stessa logica di `lead_stati_storia`,
   Realtime per il botta-e-risposta. Niente chat generica: il contesto è la pratica.
3. **Formazione** — Ahmed e Shery hanno sempre venduto, mai macchine: devono diventare
   esperti sul prodotto e sulla formula (noleggio lungo termine, e nello specifico la
   NOSTRA formula). Sezione con materiale a moduli, tracciamento "letto/completato",
   aggiornabile dall'operatore senza deploy. I contenuti nasceranno dal materiale già in
   repo (leve fiscali, sequenze, calcolatore) riscritti per la vendita a voce.
4. **Offerte** — quando ci saranno i dettagli del fornitore: le sue formule rielaborate
   in offerte commerciali nostre. Vincoli del fornitore rispettati, packaging, linguaggio
   e vendita a modo nostro. Il calcolatore parametrico è il motore; qui diventa
   argomentario di vendita per il venditore davanti al cliente.

## Non ora

Nessuna decisione tecnica vincolante presa oggi (app separata vs evoluzione della PWA,
framework, hosting): si decide quando i moduli 1–2 hanno requisiti veri maturati dall'uso.
I tasti e i comandi del flusso ci sono già tutti: prima si consuma quello.
