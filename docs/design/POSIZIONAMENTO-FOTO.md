# Fotografia editoriale — 10 immagini

Dieci foto editoriali (WebP, alta risoluzione) che completano gli SVG con il lato **umano, operativo e materico**
del brand: veicoli reali, imprenditori italiani, ambienti, atmosfere. Sono state generate da prompt AI mirati
(vedi `PROMPT-IMMAGINI-AI.md`) e già selezionate/controllate.

Palette coerente col brand (nero caldo, avorio, ottone), nessun testo o logo auto leggibile, aree negative
lasciate libere per copy e CTA.

## Mappa di posizionamento

| File | Formato | Dove va nel sito | Come usarla | Alt text consigliato |
|---|---|---|---|---|
| `foto-hero.webp` | 16:9 · 2560×1440 | Homepage, hero principale | Visual a destra dell'hero, o sfondo con velo nero. Non mettere copy sul volto. | Imprenditore accanto a un furgone commerciale |
| `foto-chiavi.webp` | 3:2 · 2304×1536 | Sezione "come funziona" / conferma lead | Affiancamento, crop centrale sul gesto. Il momento del possesso. | Consegna delle chiavi di un veicolo |
| `foto-tranquillita.webp` | 16:9 · 2560×1440 | Sezione benefici, prima della CTA finale | Copy a sinistra, soggetto a destra. Aggancia il claim "non ci pensi più". | Imprenditrice serena nel proprio studio |
| `foto-flotta.webp` | 16:9 · 2560×1440 | Landing `/aziende`, sezione flotte/PMI | Visual panoramico sopra/sotto un blocco testo. Niente copy sui mezzi. | Tre veicoli commerciali per una piccola flotta |
| `foto-artigiano.webp` | 3:2 · 2304×1536 | Landing `/artigiani`, veicoli commerciali | A tutta larghezza o mezza colonna, furgone sul lato destro. | Furgone commerciale davanti a un laboratorio |
| `foto-agente.webp` | 16:9 · 2560×1440 | Landing `/agenti`, mobilità professionale | Affiancata a un testo breve, non come fondo del testo. | Professionista che sale su una berlina |
| `foto-studio.webp` | 16:9 · 2560×1440 | Pagina `/chi-siamo`, blocco istituzionale | Full-bleed con overlay avorio tenue. **L'immagine dell'insight "studio di consulenza".** | Interno di uno studio di consulenza |
| `foto-materia.webp` | 1:1 · 1920×1920 | Dettagli di sezione, intermezzi | Accento quadrato o texture ritagliata. Non come hero primario. | Dettaglio di ottone spazzolato e nero opaco |
| `foto-consulenza.webp` | 3:2 · 2304×1536 | Sezione servizi / consulenza dedicata | Mezza colonna vicino alla spiegazione della relazione 1:1. | Consulente e cliente esaminano una proposta |
| `foto-sfondo.webp` | 16:9 · 2560×1440 | Hero secondari, CTA, header di pagina | Sfondo pieno con copy chiaro/oro nell'area centrale-destra. Molto scura. | Riflessi dorati su una superficie scura |

## Come le foto e gli SVG lavorano insieme

Ogni foto ha un SVG "gemello" che rafforza lo stesso messaggio — usarli in coppia dà coerenza:
- `foto-hero` ↔ `blocchi/hero.svg`
- `foto-chiavi` ↔ `scene/consegna-chiavi.svg` (entrambi: il momento del possesso)
- `foto-tranquillita` ↔ `scene/tranquillita.svg` (entrambi: "non ci pensi più")
- `foto-flotta` ↔ `scene/flotta.svg`
- `foto-consulenza` ↔ `icone-business/consulenza-dedicata.svg`
- `foto-materia` ↔ `ornamenti/` (texture di brand)
- `foto-sfondo` ↔ `ornamenti/raggi-hero.svg`, `guilloche-onde.svg`

## Note tecniche

- **Già in WebP** e ad alta risoluzione: pronte per `next/image` con `sizes` responsive, contenitore ad altezza
  esplicita e `object-fit: cover`. Le 3:2 vogliono un crop centrale morbido, senza tagliare mani/volto/veicolo.
- Convenzione URL suggerita: `/foto/<nome>.webp` (separata da `public/img/veicoli/`, riservata alle foto dei
  singoli veicoli del catalogo).
- **Accessibilità**: usare gli alt text della tabella; se una foto è puramente decorativa in un dato contesto,
  metterla `alt=""`. Verificare il contrasto del copy sovrapposto nel componente finale.
- Le immagini panoramiche stanno bene in contenitori 16:9; `foto-sfondo` e `foto-studio` reggono overlay per il testo.

## Nota onesta (come per gli SVG)

Sono immagini **generate da AI**: possono avere piccole imperfezioni (dettagli, riflessi, mani). Sono una **base
selezionata da cui scegliere e rifinire**, non asset intoccabili — il designer valuterà quali usare e se ritoccarle.
Sono state comunque controllate per coerenza cromatica, assenza di testo/loghi leggibili e naturalezza.
