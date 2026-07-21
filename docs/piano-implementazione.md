# Piano di implementazione — motore lead

> Strategia: si costruisce tutto sul branch `ricerca-agente`, si mergia **a pezzi**.
> Nessuna scrittura su DB fino al deploy delle migration. Spec complete prima del codice
> (sono in `docs/spec-*.md`).

## Verdetto merge: spezzato, non diretto

Il pacchetto tocca tre superfici diverse: file inerti (docs, batch, script CLI), schema DB,
e UX. Le prime due sono merge-safe da subito; la UX di casa base va rifatta guardandola —
la pagina lead era pensata per tutti, ora è personale dell'operatore. Quindi: 6 PR
sequenziali, main mai rotto, ogni PR guardabile e testabile da sola.

## Le PR

| # | Contenuto | Rischio | Quando |
|---|---|---|---|
| 1 | **Inerte**: spec, pattern, skill, 16 batch, gate, generatore contatti (= i commit già su questo branch) | zero: nessun runtime toccato | subito |
| 2 | **Schema**: migration 009 (venditori) e 010 (ponte azienda→lead, nota in storia, stati estesi) + `STATI_LEAD` + transizioni + test | basso: tutto additivo | mercoledì |
| 3 | **Casa base**: pagina lead ridisegnata per l'operatore (`spec-casa-base-lead.md`) | medio: è la UX da guardare | giovedì |
| 4 | **/vendita** PWA F1 per i venditori (`spec-app-agenti.md`) + RLS | medio | venerdì |
| 5 | **Aggancio**: notifica Telegram all'assegnazione + calcolatore parametrico `?forma&veicolo` — il lib è già modulare, PR piccola del collega | basso | venerdì |
| 6 | **Fase 2**: crocette sul "perso", data di ricontatto, viste esiti | basso | settimana prossima |

## Regole di ingaggio

1. Migration solo additive: nessuna colonna rimossa, nessun dato migrato, gli stati
   esistenti restano validi. Si applicano al deploy, quando lo decide l'operatore.
2. Env (`SUPABASE_*`, token Telegram) solo al deploy, mai nel repo.
3. La verifica fiscale del calcolatore **non blocca**: componente modulare, si aggiornano i
   numeri quando validati — i golden test fanno da rete di protezione.
4. Ogni PR porta test dove esiste già un modello (`transizione.test.ts`, RLS).
5. Il magazzino si accende con il primo `aziende:importa` dopo la PR 2: prima di allora
   nessuna scrittura.

## Timeline settimana

Lun — ricerca, gate, magazzino (66 aziende) ✓
Mar — pacchetto spec completo (questo commit) ✓
Mer — PR 1 + 2 · Gio — PR 3 · Ven — PR 4 + 5 · Fase 2 a seguire.

Una volta acceso, questo motore è il cuore: cerca, qualifica, contatta, smista, vende —
e ogni esito torna indietro come dato.
