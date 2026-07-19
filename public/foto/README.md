# Fotografia editoriale — Impero Automotive

Questa cartella contiene le **dieci fotografie editoriali** destinate alle pagine pubbliche del sito. Gli asset sono complementari agli SVG esistenti: introducono il lato umano, operativo e materico del brand senza sostituire la firma grafica vettoriale.

Tutti i file sono stati esportati in **WebP**, non contengono testo o loghi auto riconoscibili e rispettano la palette nero caldo, avorio e ottone del progetto. I file sono in alta definizione, così da poter essere usati con `next/image` e serviti in dimensioni responsive.

## Schede di posizionamento

| File | Formato e dimensioni | Posizionamento consigliato | Destinazione nel sito | Copy/alt consigliato |
| --- | --- | --- | --- | --- |
| `foto-hero.webp` | 16:9 · 2560×1440 | Visual laterale sul lato destro dell'hero oppure sfondo con velo nero; non sovrapporre copy sul volto. | Homepage, hero principale. | `Imprenditore accanto a un furgone commerciale` |
| `foto-chiavi.webp` | 3:2 · 2304×1536 | Immagine di affiancamento, con crop centrale sul gesto di consegna. | Sezione “Come funziona”, conferma lead o momento di consegna. | `Consegna delle chiavi di un veicolo` |
| `foto-tranquillita.webp` | 16:9 · 2560×1440 | Copy a sinistra, soggetto a destra; mantenere l'ariosità della finestra. | Sezione benefici prima della CTA finale. | `Imprenditrice serena nel proprio studio` |
| `foto-flotta.webp` | 16:9 · 2560×1440 | Visual panoramico, senza sovrapporre copy ai veicoli; ideale sopra o sotto un blocco testuale. | Landing `/aziende`, sezione flotte/PMI. | `Tre veicoli commerciali per una piccola flotta aziendale` |
| `foto-artigiano.webp` | 3:2 · 2304×1536 | Immagine a tutta larghezza del modulo o in metà colonna; mantenere il furgone sul lato destro. | Landing `/artigiani`, sezione veicoli commerciali. | `Furgone commerciale davanti a un laboratorio artigiano` |
| `foto-agente.webp` | 16:9 · 2560×1440 | Visual affiancato a un testo breve; non usare come fondo del testo. | Landing `/agenti`, sezione mobilità professionale. | `Professionista che sale su una berlina` |
| `foto-studio.webp` | 16:9 · 2560×1440 | Banner o sezione in full-bleed con overlay avorio tenue; preservare l'architettura. | Pagina `/chi-siamo`, blocco istituzionale. | `Interno di uno studio di consulenza` |
| `foto-materia.webp` | 1:1 · 1920×1920 | Accento quadrato o background ritagliato per transizioni; non usare come hero primario. | Dettagli di sezione, ornamenti e intermezzi. | `Dettaglio di ottone spazzolato e nero opaco` |
| `foto-consulenza.webp` | 3:2 · 2304×1536 | Metà colonna vicino a una spiegazione della relazione 1:1. | Sezione servizi o consulenza dedicata. | `Consulente e cliente esaminano una proposta` |
| `foto-sfondo.webp` | 16:9 · 2560×1440 | Sfondo pieno con copy chiaro o oro nell'area centrale/destra; evitare filtri pesanti. | Hero secondari, CTA e header di pagina. | `Riflessi dorati su una superficie scura` |

## Convenzioni tecniche

Gli asset usano la convenzione URL `/foto/<nome-file>.webp`. Per la resa migliore, utilizzare `next/image` con `sizes` coerente al breakpoint, un contenitore con altezza esplicita e `object-fit: cover`. Le immagini panoramiche sono adatte a contenitori 16:9; quelle 3:2 devono mantenere un crop centrale morbido, senza tagliare mani, volto o veicolo.

> **Nota di composizione:** l'immagine hero e le immagini delle landing sono state pensate come visual affiancati al testo o come fondali con overlay. Per mantenere l'accessibilità, il contrasto del copy va verificato nel componente finale e le immagini puramente decorative devono avere `alt=""`.

## Controllo qualità

Ogni asset selezionato è stato verificato per coerenza cromatica, assenza di testo e loghi leggibili, naturalezza degli elementi umani e qualità adatta a uso web. I riscontri di controllo e le decisioni di integrazione sono raccolti in [`docs/asset-visuali-riscontri.md`](../../docs/asset-visuali-riscontri.md).
