# Catalogo SVG — Impero Automotive

Libreria di asset vettoriali per la futura branch di design (orientata alla conversione/CRO).
Tutti gli SVG seguono l'identità del brand: fondo nero caldo (`#12100D`), oro con gradiente
(`#E8D5A4 → #C9A96B → #8F6D3C`) usato come metallo prezioso, serif per i titoli.

**Aprire `index.html`** per sfogliare tutto il catalogo con anteprime, uso suggerito, ricerca e download.

## Struttura (60 SVG in 8 famiglie + 10 foto)

- `icone/` — 11 icone benefit "prodotto" (tratto pieno): anticipo zero, rata fissa, tutto incluso,
  manutenzione, assicurazione, bollo, assistenza, km, pronta consegna, deducibile, preventivo veloce.
- `icone-business/` — 8 icone "consulenza" (tratto fine, più geometriche): risparmio fiscale, gestione
  flotta, consulenza dedicata, consegna nazionale, confronto offerte, analisi costi, supporto aziende,
  risposta 24h. Parlano alle PMI: non "cosa noleggi" ma "come lavoriamo con te".
- `ornamenti/` — 5 elementi decorativi (filetto, cornice, texture guilloché, rosetta-sigillo, raggi hero).
- `scene/` — 4 spot illustrativi (le chiavi sono tue, skyline & strada, flotta, non ci pensi più).
- `wow/` — 5 pezzi ad alto impatto per la CRO (emblema hero, cartiglio prezzo, sigillo anticipo zero, freccia CTA, trust badge CTA).
- `componenti/` — 16 mockup di componenti UI (header, nav mobile, footer, bottoni, scheda veicolo,
  campi form, box & pannelli, modale, badge & etichette, stepper, accordion FAQ, fascia trust,
  testimonianza, banner CTA, configuratore, tabella confronto).
- `blocchi/` — 6 sezioni intere di landing, pronte da assemblare: hero con CTA, perché scegliere noi,
  timeline processo, card vantaggi, banner fiscale, calcolatore risparmio.
- `varianti/` — 4 dimostrazioni evidence-based (isolamento CTA, prezzo charm vs premium, rating credibile,
  generica vs firma). Non sono asset finali: rendono *visibile* una scelta di conversione supportata da ricerca.
- `foto/` — 10 fotografie editoriali (WebP): imprenditori, veicoli, ambienti e atmosfere — il lato umano e
  materico del brand. Generate da prompt AI mirati. Mappa di posizionamento in `foto/POSIZIONAMENTO-FOTO.md`.

E i documenti nella radice:
- `NOTE-STRATEGICHE-DESIGN.md` — **il razionale con le fonti**: perché certe scelte visive, distinguendo ciò
  che è misurato da studi da ciò che è inferenza. Da leggere insieme alla cartella `varianti/`.
- `grammatica-visiva.svg` — la tavola del design system (un elemento, un significato).
- `anteprima-*.png` — contact sheet PNG di componenti, blocchi, icone business, varianti e grammatica.

Più due asset di documentazione nella radice:
- `grammatica-visiva.svg` — la tavola del design system: un elemento, un significato (icone=vantaggi,
  badge=promozioni, box=strumenti, card=veicoli, ribbon=offerte, pattern=autorevolezza).
- `anteprima-*.png` — contact sheet PNG dei componenti e delle icone, comodi da sfogliare fuori dal browser.

## I due registri di icone (indicazione del designer)

Su suggerimento del designer, le icone seguono **due stili distinti e complementari**:
- **`icone/` (prodotto)** — tratto pieno (~3px), più illustrative → raccontano *cosa ottieni*.
- **`icone-business/` (consulenza)** — tratto fine (~1.8px), geometriche, essenziali → raccontano *come lavoriamo con te*, e puntano a un'identità riconoscibile ("questa icona è di quel sito") e a una sensazione di precisione, quasi da studio di consulenza.
Sono volutamente diversi come "temperatura": servono a decidere in fase di design quale direzione far prevalere, o come alternarle.

## Come leggere questo catalogo

Questo è un **catalogo di idee e riferimenti**, prodotto volutamente in eccesso rispetto al necessario:
serve a dare al designer una base ricca da cui **scegliere, prendere ispirazione e affinare**, riducendo
il lavoro a foglio bianco. Non tutti gli asset verranno usati, e diversi hanno tratti da rifinire:
la messa a punto di precisione va fatta sui pochi effettivamente scelti, in fase di design.

In particolare, la famiglia **`componenti/`** sono **mockup**, non codice o design finali: mostrano
struttura, gerarchia visiva e tono del brand già impostati (bottoni, card, form, header/footer…),
così chi cura il design parte da una direzione concreta invece che da zero.

## Note tecniche per il design

- Icone su `viewBox 0 0 120 120`, scalano da ~24px in su. La maggior parte ha l'oro incorporato come gradiente.
- Negli asset **wow** e nei **componenti**, testi e prezzi (es. "245", "344") sono **segnaposto editabili** direttamente nel file SVG.
- Font nei testi SVG: Georgia/serif come fallback di **Fraunces**, Helvetica/Arial come fallback di **Instrument Sans**.
  In produzione: convertire i testi in tracciati oppure sostituire i `font-family` per allinearli ai font reali del sito.
- Palette brand di riferimento: nero `#12100D`, grafite `#26231E`, avorio `#F6F3EC`, oro `#B08D4F`, oro chiaro `#D6BC8A`.

## La direzione: un design system, non un sito

Il valore di questo catalogo non è nei singoli pezzi ma nell'insieme coerente. La progressione è voluta:
dalle **icone** (il vocabolario) ai **componenti** (le parole) ai **blocchi** (le frasi). Montando i blocchi
si compongono landing intere senza ridisegnare da zero — il che rende molto più rapido **testare e ottimizzare
le varianti del funnel**. È la naturale evoluzione del lavoro: non un sito, ma un sistema orientato alla
conversione, pronto a crescere con nuove landing, categorie e servizi mantenendo la stessa grammatica visiva.

## Ottimizzazione tecnica (fase 2)

Gli SVG di questo pacchetto sono **ottimizzati e pronti per il sito**:
- Peso ridotto ~16% (commenti, whitespace e metadati rimossi), rendering **identico** all'originale (verificato con pixel-diff su tutti i file).
- **id resi univoci** (prefisso `imp_`): nessuna collisione di gradienti se più SVG vengono inseriti inline nella stessa pagina.
- `viewBox` e attributi di accessibilità (`role`, `aria-label`) mantenuti apposta.
- Config inclusa in `svgo.config.js` (per ri-ottimizzare nuovi asset: `svgo --config svgo.config.js -rf <cartella>`).

**Per l'implementazione vedi `GUIDA-TECNICA-POSIZIONAMENTO.md`**: mappa asset→sezione del sito + note tecniche
(come inserirli inline/img/sprite, gestione font, performance, placeholder da sostituire).
