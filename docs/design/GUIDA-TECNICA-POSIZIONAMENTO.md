# Guida tecnica e di posizionamento — asset SVG Impero

Documento per chi implementa il sito. Due parti:
1. **Dove va ogni asset** (mappa asset → sezione del sito), così non serve rifare il ragionamento.
2. **Note tecniche di implementazione** (come inserirli senza rallentare né rompere nulla).

> **Fotografia:** il pacchetto include anche 10 foto editoriali in `foto/` (imprenditori, veicoli, ambienti).
> La loro mappa di posizionamento dettagliata è in `foto/POSIZIONAMENTO-FOTO.md`.

Gli SVG in questo pacchetto sono **già ottimizzati** (vedi in fondo "Cosa è stato fatto"): puliti, leggeri,
con id anti-collisione e accessibilità preservata. Sono pronti da inserire.

---

## 1. Mappa di posizionamento

Ordine tipico di una landing di conversione, dall'alto verso il basso. Per ogni sezione: quali asset usare.

### Above the fold (la prima schermata — decide entro pochi secondi)
- **Header**: `componenti/header.svg` (desktop), `componenti/nav-mobile.svg` (mobile).
  → L'oro-pieno solo sulla CTA "Richiedi preventivo"; le voci di menu restano neutre.
- **Hero**: `blocchi/hero.svg` come struttura di riferimento.
  → Headline + doppia CTA. L'elemento grafico a destra (ruota-emblema) è *brand*, non deve rubare l'occhio alla CTA:
  valutare di attenuarlo o rimpicciolirlo. Vicino alla CTA principale, mettere `wow/trust-cta.svg` (le micro-garanzie).
- **Cartiglio prezzo** (se si mostra il "da …€/mese" nell'hero): `wow/cartiglio-prezzo.svg`.
  → Ricordarsi di sostituire il numero placeholder col canone reale e togliere la nota "sostituisci 245".

### Sezione benefici (perché conviene)
- **Griglia vantaggi**: `blocchi/card-vantaggi.svg`, che usa le `icone/` (assicurazione, manutenzione, bollo,
  assistenza, km-inclusi, pronta-consegna). In alternativa compatta: `componenti/box-pannelli.svg`.
- **Icone singole** (`icone/`): una per ogni vantaggio elencato. Dimensione consigliata 48–64px.
- **Perché scegliere noi**: `blocchi/perche-noi.svg` (i 3 punti forti con icone in medaglione).

### Sezione fiducia/autorevolezza
- **Fascia numeri**: `componenti/fascia-trust.svg` (500+ aziende · 48h · 0€).
- **Testimonianza**: `componenti/testimonianza.svg`. → Se si usano le stelle, tenerle sotto il 5,0 pieno
  (un 4,6 con numero di recensioni converte di più — vedi NOTE-STRATEGICHE, variante `rating-credibile`).
- **Sigillo trust**: `wow/badge-anticipo-zero.svg` accanto ai punti di conversione.
- **Emblema brand**: `wow/emblema-hero.svg` — pezzo di autorevolezza, per sezione "chi siamo" o footer, non per convertire.
- **Pattern di sfondo**: `ornamenti/guilloche-onde.svg`, `ornamenti/rosetta-sigillo.svg`, `ornamenti/raggi-hero.svg`.

### Sezione "come funziona"
- **Timeline**: `blocchi/timeline-processo.svg` (i 4 passi) oppure `componenti/stepper.svg`.

### Sezione decisione/confronto (molto efficace per la CRO)
- **Comparatore**: `blocchi/... ` → usare `componenti/tabella-confronto.svg` (noleggio vs acquisto).
- **Banner fiscale**: `blocchi/banner-fiscale.svg` (il "100% deducibile" — gancio forte per le PMI).
- **Calcolatore/Configuratore**: `blocchi/calcolatore.svg` (risparmio/TCO) e `componenti/configuratore.svg` (canone).

### Sezione emotiva (spesso trascurata nel B2B — ma qui è una leva)
- **"Non ci pensi più"**: `scene/tranquillita.svg`. → Il sollievo di non gestire nulla. Vicino a un blocco benefici
  o prima della CTA finale. Aggancia il messaggio-ombrello "senza pensieri".
- **"Le chiavi sono tue"**: `scene/consegna-chiavi.svg`. → Il momento del possesso; ottimo prima/dopo il form.

### Catalogo veicoli
- **Card veicolo**: `componenti/scheda-veicolo.svg` (ripetuta per ogni mezzo).
- **Badge/etichette**: `componenti/badge-etichette.svg` (pronta consegna, elettrica, N1, deducibile, in evidenza).
- **Ribbon offerta**: il nastro angolare in `componenti/badge-etichette.svg`.
- **Scena flotta**: `scene/flotta.svg` per landing PMI/multi-veicolo.

### Chiusura pagina
- **Banner CTA finale**: `componenti/banner-cta.svg` o `blocchi/...`.
- **Footer**: `componenti/footer.svg`.

### Icone "business" (`icone-business/`) — dove il tono è consulenziale
Da usare nelle sezioni B2B che parlano di *come lavoriamo*, non di *cosa noleggi*:
- landing PMI, sezione servizi dedicati, "perché affidarti a noi", pagina aziende.
- Es.: `risparmio-fiscale` e `analisi-costi` vicino al calcolatore; `gestione-flotta` sulla landing flotte;
  `consulenza-dedicata`/`supporto-aziende` nella sezione servizi; `risposta-24h` vicino al form; `consegna-nazionale`
  nella sezione copertura; `confronto-offerte` vicino al comparatore.

### Elementi UI trasversali (ovunque servano)
- **Bottoni**: `componenti/bottoni.svg` (riferimento stili). → In pagina: oro-pieno = 1 sola CTA per sezione.
- **Form**: `componenti/campi-form.svg` (stati focus/errore, microcopy "perché" sul telefono già inclusa).
- **Modale**: `componenti/modale.svg` (dialog preventivo).
- **Box/alert**: `componenti/box-pannelli.svg` (info, successo, avviso, offerta).
- **Filetti/cornici**: `ornamenti/filetto-rombo.svg`, `ornamenti/cornice-angoli.svg`.

### Documentazione (non vanno nel sito)
- `grammatica-visiva.svg`, la cartella `varianti/`, i file `anteprima-*.png`, i due `.md`. Sono per il team.

---

## 2. Note tecniche di implementazione

### Come inserire gli SVG — tre modi, quando usarli
1. **Inline** (`<svg>…</svg>` nel markup): quando serve **stilizzarli via CSS** o cambiare colore su hover/stato.
   È il caso di icone e bottoni che devono reagire (es. icona che diventa oro-chiaro al passaggio del mouse).
   → Gli id sono già prefissati `imp_` per non collidere tra SVG diversi nella stessa pagina.
   → Molti tratti usano `stroke="url(#imp_…)"`: se si vuole cambiare colore via CSS, sostituire il gradiente con
   `currentColor` e pilotare il colore col testo (alcune icone, es. il monogramma, già usano `currentColor`).
2. **`<img src="…">` o CSS `background`**: quando l'asset è **statico e decorativo** (sfondi, pattern, ornamenti,
   scene, blocchi usati come immagine). Più leggero per il browser, e l'SVG resta cache-abile.
3. **Sprite SVG** (`<use href="#id">`): se si ripetono molte icone uguali (es. la stessa spunta ovunque),
   conviene un unico file sprite e riferimenti. Riduce le richieste HTTP.

**Regola pratica**: icone interattive → inline; sfondi/decori/scene/blocchi → `<img>`/background; icone ripetute → sprite.

### Peso e performance
- Peso totale asset: **~110 KB** per 60 SVG (media ~0.8 KB a icona). Trascurabile, ma:
- Servire con **compressione gzip/brotli** dal server: gli SVG sono testo, si comprimono ~70–80% in più.
- Impostare **cache headers** lunghi (gli asset non cambiano spesso).
- Per gli asset grandi usati come sfondo (blocchi, scene), valutare `loading="lazy"` se sotto la piega.

### Font negli SVG (importante)
- I testi negli SVG usano fallback: **Georgia** (per Fraunces) e **Helvetica/Arial** (per Instrument Sans).
- In produzione, due strade:
  a) **Convertire i testi in tracciati** (outline) → resa identica ovunque, ma testo non più modificabile/selezionabile.
  b) **Sostituire i `font-family`** con i font reali del sito e assicurarsi che siano caricati → testo resta editabile.
- Scelta consigliata: (b) per gli asset con testo che potrebbe cambiare (prezzi, claim); (a) per loghi/emblemi fissi.

### Accessibilità (già impostata, da mantenere)
- Ogni SVG ha `role="img"` e `aria-label`: gli screen reader lo annunciano. **Non rimuoverli.**
- Se un'icona è puramente decorativa e affiancata a testo che già dice la stessa cosa, si può invece marcarla
  `aria-hidden="true"` per evitare doppioni di lettura. Valutare caso per caso.
- Contrasto: l'oro su nero e su avorio rispetta le soglie; verificare i testi piccoli su fondo oro.

### Colore e temi
- Palette: nero `#12100D`, grafite `#26231E`, avorio `#F6F3EC`, oro `#B08D4F`, oro-chiaro `#D6BC8A`.
- I gradienti oro sono definiti nei `<defs>` di ogni file. Se si vuole un oro unico centralizzato, si può estrarre
  il gradiente in un unico `<svg>` di definizioni e referenziarlo — ma con id prefissati funziona già tutto separato.

### Placeholder da sostituire (non lasciare in produzione)
- `wow/cartiglio-prezzo.svg`: numero "245" e nota "sostituisci…".
- `componenti/scheda-veicolo.svg`, `blocchi/calcolatore.svg`: numeri di esempio (344, 4.800, ecc.).
- `componenti/footer.svg`, `blocchi/hero.svg`: recapiti e P.IVA fittizi.
- `componenti/fascia-trust.svg`: i numeri (500+, 48h) vanno confermati come reali o adattati.

---

## Cosa è stato fatto in ottimizzazione (per trasparenza)

- **SVGO** con configurazione su misura (`svgo.config.js` incluso nel pacchetto), **verificata con pixel-diff
  automatico su tutti i 60 file: differenza massima 1/255, cioè rendering identico all'originale**.
- Rimossi: commenti di sviluppo, metadati inutili, whitespace/indentazione.
- **id resi univoci** con prefisso `imp_`: nessuna collisione se più SVG vengono messi inline nella stessa pagina
  (senza questo, i gradienti di un file "sovrascriverebbero" quelli di un altro con lo stesso id).
- **Mantenuti apposta**: `viewBox` (scaling responsive), `role`/`aria-label` (accessibilità/SEO).
- **Disattivate apposta** le trasformazioni aggressive dei path (rimozione delle chiusure `Z`, coordinate relative):
  spostavano impercettibilmente i vertici degli stroke sottili. Il guadagno era minimo, il rischio no.
- Risparmio: **~16%** di peso, a rendering garantito identico.

La config è inclusa: per ri-ottimizzare eventuali nuovi asset, `svgo --config svgo.config.js -rf <cartella>`.
