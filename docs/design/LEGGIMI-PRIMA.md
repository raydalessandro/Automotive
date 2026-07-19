# Catalogo asset visivi — Impero Automotive

Libreria di asset grafici per la futura branch di design del sito, orientata alla conversione (CRO).
Questo pacchetto è pensato per essere **consegnato a chi cura il design**: contiene gli asset, le anteprime,
e la documentazione del *perché* e del *dove*, così non serve rifare il ragionamento da zero.

> **Da dove partire:** apri **`index.html`** nel browser. È il catalogo sfogliabile: mostra tutti gli asset
> per famiglia, con anteprima, uso suggerito e download. È il modo più veloce per vedere cosa c'è.

---

## Cosa c'è qui dentro

### Gli asset (60 SVG, in 8 famiglie)
| Cartella | Cosa contiene |
|---|---|
| `icone/` | 11 icone benefit "prodotto" (anticipo zero, rata fissa, tutto incluso, manutenzione…) |
| `icone-business/` | 8 icone "consulenza" per le PMI (risparmio fiscale, gestione flotta, analisi costi…) |
| `ornamenti/` | 5 elementi decorativi (filetti, cornici, texture, sigilli) |
| `scene/` | 4 spot illustrativi (le chiavi sono tue, flotta, skyline, "non ci pensi più") |
| `wow/` | 5 pezzi ad alto impatto (emblema, cartiglio prezzo, sigillo, trust badge) |
| `componenti/` | 16 mockup di UI (header, footer, bottoni, form, card, tabella, modale…) |
| `blocchi/` | 6 sezioni intere di landing (hero, perché noi, timeline, banner fiscale, calcolatore…) |
| `varianti/` | 4 dimostrazioni evidence-based (isolamento CTA, prezzo, rating, riconoscibilità) |
| `foto/` | 10 fotografie editoriali (WebP): imprenditori, veicoli, ambienti — il lato umano e materico del brand |

Più `grammatica-visiva.svg` nella radice (la tavola del design system).

### La documentazione (i file da leggere)
1. **`README.md`** — il dettaglio completo del catalogo: ogni famiglia, le note per il design, la palette.
2. **`NOTE-STRATEGICHE-DESIGN.md`** — **il perché**. Le scelte visive supportate da ricerca di marketing
   (cosa converte nel B2B ad alto valore), con le fonti. Distingue ciò che è misurato da ciò che è inferenza.
3. **`GUIDA-TECNICA-POSIZIONAMENTO.md`** — **il dove e il come**. Mappa ogni asset alla sezione del sito,
   più le note tecniche di implementazione (inserimento, font, performance, placeholder da sostituire).
4. **`PROMPT-IMMAGINI-AI.md`** — i 10 prompt usati per generare le **fotografie** (in `foto/`), che i vettoriali
   non coprono (veicoli reali, imprenditori, ambienti, atmosfere). Utile se si vogliono rigenerare o ampliare.

Nella cartella `foto/` c'è anche **`POSIZIONAMENTO-FOTO.md`**: mappa ogni foto alla sezione del sito, con alt text
e l'abbinamento foto↔SVG "gemello".

### Il resto
- `index.html` — catalogo sfogliabile (**inizia da qui**).
- `anteprima-*.png` — contact sheet delle famiglie, comodi da guardare fuori dal browser.
- `svgo.config.js` — la configurazione di ottimizzazione, per ri-ottimizzare eventuali nuovi asset.

---

## Come è stato costruito (il metodo)

Non è un mucchio di icone: è un **design system orientato alla conversione**, costruito in progressione.
- **Icone** → il vocabolario visivo.
- **Componenti** → le parole (bottoni, card, form…).
- **Blocchi** → le frasi (sezioni intere da assemblare in una landing).

Il lavoro è volutamente **in eccesso** rispetto al necessario: serve a dare una base ricca da cui scegliere e
affinare, non un set "definitivo". Non tutti gli asset verranno usati, e diversi hanno tratti da rifinire —
la messa a punto di precisione va fatta sui pochi effettivamente scelti, in fase di design.

Le scelte visive più importanti sono state **validate con evidenza di marketing** (non a gusto): come mostrare
il prezzo, dove mettere i trust signal, perché la CTA converte per contrasto e non per colore. Il razionale
completo è in `NOTE-STRATEGICHE-DESIGN.md`.

---

## Note importanti per chi implementa

- Gli SVG sono **già ottimizzati** (leggeri, id anti-collisione, accessibilità preservata) e pronti da inserire.
- I testi negli asset (prezzi, claim, recapiti) sono **segnaposto editabili**: vanno sostituiti coi valori reali.
  La lista dei placeholder è in `GUIDA-TECNICA-POSIZIONAMENTO.md`.
- I font negli SVG usano fallback (Georgia, Arial): in produzione vanno allineati ai font reali del sito.
- Il messaggio emotivo ricorrente **"senza pensieri / non ci pensi più"** emerge come possibile filo conduttore
  della comunicazione — vale la pena valutarlo come messaggio-ombrello.

---

*Pacchetto preparato come base di lavoro per il design. Chi cura il design sceglie cosa usare, come e dove:
questi asset e questi documenti servono a ridurgli il carico, non a decidere al posto suo.*
