# Note strategiche per il design — comunicazione visiva ad alta conversione

**Impero Automotive · noleggio a lungo termine B2B**
Documento laterale al catalogo SVG. Serve a spiegare *perché* certe scelte visive, con l'evidenza dietro,
così chi cura il design decide con cognizione — non per gusto, e non per gusto nostro.

Regola che ci siamo dati: distinguere ciò che è **misurato da studi** da ciò che è **inferenza ragionevole**.
Dove l'evidenza è debole o gonfiata dai blog, lo diciamo. I numeri "%" che girano online vanno presi con cautela
(spesso amplificati da chi cita); quello che conta è il **principio**, non la cifra decimale.

---

## Il quadro: che tipo di decisione stiamo progettando

Il nostro non è e-commerce impulsivo. È una **decisione B2B ragionata, ad alto valore, lunga e basata sulla fiducia**:
un imprenditore affida una spesa da decine di migliaia di euro distribuita su anni. Questo cambia *tutto* rispetto
ai consigli di conversione generici (che quasi sempre parlano di acquisti d'impulso sotto i 100€).

Due dati che inquadrano la posta in gioco:
- Gran parte del percorso d'acquisto B2B avviene **prima** di ogni contatto commerciale: il sito è l'unico "venditore"
  presente nella fase di ricerca anonima. Se non costruisce credibilità lì, non si entra nemmeno nella shortlist.
  *(Principio consolidato nella ricerca B2B; le cifre precise "80% / 95%" circolano su fonti secondarie — trattarle come ordine di grandezza.)*
- **La credibilità di un sito è determinata in larga parte dal design.** Il "~75% da design" risale allo
  Stanford Web Credibility Project (Fogg et al.): l'aspetto conta *prima* del contenuto. Per noi significa che
  la percezione di serietà è essa stessa una leva di conversione, non un vezzo estetico.

**Direzione che ne deriva** (in linea con l'intuizione del designer): il brand non deve gridare "automotive".
Deve comunicare **precisione** — la sensazione di entrare in uno studio di consulenza. Pulito, ordinato, professionale.

---

## I quattro focus con evidenza — e le varianti che ne abbiamo tratto

Per ogni punto: cosa dice l'evidenza, quanto è solida, e cosa abbiamo prodotto (cartella `varianti/`).

### 1. La CTA converte per **isolamento**, non per colore
→ variante `isolamento-cta.svg`

Il mito più diffuso della CRO è "il bottone rosso converte di più". È **falso come regola generale**.
Il celebre test HubSpot "rosso batte verde +21%" è frainteso: il rosso vinse *solo* perché la pagina era verde,
quindi risaltava. La variabile causale non è il colore, è il **contrasto/isolamento** — l'**effetto Von Restorff**:
un elemento che spicca da ciò che lo circonda viene notato e ricordato.
*(Solidità: alta. È il consenso delle fonti più rigorose, non un'opinione isolata.)*

Implicazione per noi, ed è **controintuitiva e importante**: l'oro è il nostro accento, ma se lo mettiamo
ovunque (titoli, bordi, liste, badge) la CTA **sparisce nel rumore dorato**. L'oro funziona come CTA solo se
è **raro nella sua zona**. La variante mostra affiancate la versione "oro ovunque" (CTA introvabile) e
"oro solo sulla CTA" (impossibile non vederla), più whitespace attorno.

Corollario utile: **gradienti e ombre non producono differenze di conversione misurabili** — sono scelte
estetiche legittime del design system, non leve da testare. Questo ridimensiona un po' gli asset "effetto wow":
belli e utili per il brand, ma non aspettarsi da soli un uplift di conversione.

### 2. Il prezzo: registro **premium/tondo + framing mensile**, non charm pricing
→ variante `prezzo-charm-vs-premium.svg`

Il charm pricing (finire in …,99) è la tattica più studiata, ma la ricerca è chiara su un punto:
funziona su **acquisti d'impulso e a basso prezzo (< ~100€)**, ed è **debole o controproducente sugli
acquisti ragionati ad alto valore**. Per gli abbonamenti, i prezzi **tondi** trasmettono più fiducia dei ,99
*(ProfitWell; solidità media — coerente con più fonti)*. Il numero pieno segnala qualità e controllo; i centesimi
su un canone pluriennale sembrano un artificio da discount e **abbassano** la percezione di serietà.

C'è però una leva di framing che **sì** è supportata da ricerca solida: **scomporre un costo grande su base mensile**.
"da 344€/mese" invece del totale pluriennale sposta l'ancora su una cifra digeribile.
*(Thomas & Morwitz 2005, Journal of Consumer Research, sul left-digit effect; Kahneman-Tversky sul framing. Solidità: alta, fonti accademiche primarie.)*

**Conclusione operativa: il cartiglio prezzo che c'è già nel catalogo è giusto così** — tondo, "da", "al mese".
Questa variante non lo cambia, lo **conferma con l'evidenza** e mostra perché la strada charm sarebbe peggiore.

### 3. Trust: **numeri specifici**, badge vicino alla decisione, e stelle **non perfette**
→ variante `rating-credibile.svg`

Tre cose misurate:
- **Specificità batte genericità.** "500+ aziende · 48h · anticipo 0" (numeri concreti) vale più di
  "tanti clienti soddisfatti". La fascia-trust già nel catalogo è impostata bene.
- **Posizione dei badge**: vicino al punto di decisione (accanto alla CTA/al form), **non nel footer**.
  I trust badge al checkout danno uplift misurabile per brand meno noti; gli stessi badge in posizioni marginali
  quasi non funzionano *(Baymard Institute; solidità medio-alta)*.
- **Il paradosso delle 5 stelle**: un rating **perfetto (5,0) appare sospetto**. Il picco di conversione è nella
  fascia **4,2–4,7**: l'imperfezione segnala autenticità *(Spiegel Research Center, Northwestern; solidità medio-alta)*.
  La variante mostra 5,0 "sembra finto" vs 4,6 "credibile" col numero di recensioni a rafforzare.

Nota onesta: molte statistiche sui trust signal ("+270% conversioni", "video +80%") vengono da fonti di parte
(agenzie, vendor di tool). Il **verso** dell'effetto è affidabile; le **cifre** no. Da non citare come numeri certi.

### 4. Riconoscibilità: rendere le icone **memorabili** senza perdere chiarezza
→ variante `generica-vs-firma.svg`

Questo risponde direttamente all'osservazione "le icone sono un po' classiche". È fondata, e c'è una teoria dietro:
il settore noleggio usa tutto lo stesso vocabolario (scudo, chiave, volante, auto) → tutte le icone si somigliano
→ nessuna si ricorda. L'**effetto Von Restorff applicato al brand** dice che un **tratto-firma coerente** rende
l'icona "di quel sito". La variante mostra uno scudo generico vs lo stesso scudo con la firma Impero
(incisione guilloché interna + gradiente oro + perla-monogramma in punta).

**Due avvertenze critiche**, altrimenti si fa un danno:
1. La firma va applicata con **coerenza a tutte** le icone, o non diventa linguaggio, diventa incoerenza.
2. Non deve **sacrificare la leggibilità a piccole dimensioni** — un'icona a 24px deve restare pulita.
   L'incisione guilloché funziona a 80px+, va semplificata o rimossa sotto.

Qui siamo al **confine tra evidenza e gusto**: che un tratto distintivo aiuti la memoria è supportato;
*quale* tratto specifico sia "il" tratto Impero è una scelta di design che lasciamo — proponiamo una strada, non la imponiamo.

---

## La grammatica visiva (ricapitolo, dal design system)

Perché l'utente impari il linguaggio del sito senza accorgersene, ogni elemento = un significato, ripetuto ovunque:

| Elemento | Significato |
|---|---|
| Icone | vantaggi (cosa ottieni) |
| Icone business | come lavoriamo con te |
| Badge | promozioni, stato |
| Box | strumenti (calcolatore, configuratore) |
| Card | veicoli |
| Ribbon | offerte |
| Pattern/guilloché | autorevolezza |

*(Vedi anche `grammatica-visiva.svg`.)*

---

## Cosa NON abbiamo fatto (di proposito)

- Non abbiamo preso direzioni **speculative**: dove non c'era evidenza, ci siamo fermati e l'abbiamo lasciato al design.
- Non abbiamo trasformato le cifre dei blog in "verità": distinguiamo principio (affidabile) da numero (spesso gonfiato).
- Non abbiamo toccato le scelte già corrette (es. il cartiglio prezzo): le abbiamo confermate con la ragione del perché.

## Come usare queste varianti

Le 4 varianti in `varianti/` sono **dimostrazioni del principio**, non asset finali da incollare nel sito.
Servono a rendere *visibile* il razionale: il designer le guarda, capisce il perché, e decide se, dove e come
applicarlo agli asset reali. È un aiuto alla decisione, non una decisione presa al posto suo.

---

## Rilievi dalla revisione visual (fase di affinamento strategico)

Rivedendo tutto il catalogo con l'occhio di marketing (non estetico), sono emersi punti concreti. Alcuni li abbiamo
già corretti negli asset; altri sono note per chi cura il design.

**Interventi già fatti sugli asset:**
- **Icone ricalibrate verso il beneficio, meno cliché**: `tutto-incluso` (era ombrello, cliché assicurativo → ora
  pacchetto unico = "tutto in uno"), `deducibile` (era documento timido → ora euro con ritorno, più impatto per le
  PMI, che è il beneficio-chiave), `km-inclusi` (era tachimetro = "velocità" + "KM" ridondante → ora strada/percorso
  incluso), `preventivo-veloce` (era fulmine, ambiguo con l'elettrico → ora documento + frecce di rapidità),
  `rata-fissa` (aveva testo che sparisce a 24px → ora linea piatta + colonne uguali).
- **Nuova scena emotiva** `tranquillita.svg` ("non ci pensi più"): copre la corda emotiva B2B che mancava (il cliente
  non compra un'auto, compra il non doverci pensare). I pensieri gestionali sfumano attorno a un segno di quiete.
- **Nuovo trust badge** `wow/trust-cta.svg`: micro-garanzie (gratuito / dati protetti / 48h) da mettere **accanto alla
  CTA**, dove l'evidenza dice che i trust signal funzionano (Baymard), non nel footer.
- **Form**: aggiunta la microcopy "ci serve solo per inviarti il preventivo" sul campo telefono — spiegare *perché*
  si chiede un dato sensibile aumenta il completamento (NN/G).

**Note per il designer (scelte che spettano a lui):**
- **Isolamento dell'oro**: nella tavola `bottoni.svg` mostriamo più bottoni oro per completezza, ma **in pagina reale
  l'oro-pieno va solo sulla CTA principale** della sezione. Secondari in ghost/scuro. Vale anche per l'**hero**: la
  ruota-emblema dorata è bella (autorevolezza) ma compete con la CTA per l'attenzione — valutare se attenuarla o
  spostarla quando c'è una CTA forte accanto.
- **Asset decorativi vs asset che convertono**: `scene/skyline-strada` ed `emblema-hero` sono asset di *atmosfera/brand*
  (pattern = autorevolezza), non di conversione diretta. Bellissimi, ma da posizionare come sfondo/brand, non aspettarsi
  da soli un uplift. Il cartiglio prezzo, il banner fiscale, la tabella confronto e i trust badge sono invece i pezzi
  che *lavorano* sulla conversione.
- **Il cartiglio prezzo** ha una nota placeholder ("sostituisci 245"): ricordarsi di rimuoverla in produzione.
- **Messaggio guida ricorrente**: il claim **"senza pensieri / non ci pensi più"** emerge come il filo emotivo più forte
  del progetto (hero, scena tranquillità). Vale la pena valutarlo come messaggio-ombrello del sito, non solo come copy locale.
- **Pezzi di punta da tenere centrali**: tabella confronto (comparatore), banner fiscale (100% deducibile),
  scena "le chiavi sono tue" (momento del possesso), calcolatore risparmio (TCO). Sono i più forti strategicamente.

---

### Fonti principali (per verifica diretta)
- Nielsen Norman Group — *B2B Websites Usability* (report, 188 linee guida); articoli su form design e credibilità.
- Baymard Institute — usabilità form e posizionamento trust badge.
- Thomas, M. & Morwitz, V. (2005), *"Penny Wise and Pound Foolish: The Left-Digit Effect in Price Cognition"*, Journal of Consumer Research.
- Kahneman, D. & Tversky, A. — framing effects (Science, 1974; 1981).
- Spiegel Research Center (Northwestern) — impatto dei rating; fascia 4,2–4,7.
- Stanford Web Credibility Project (Fogg et al.) — il peso del design nella credibilità percepita.
- Sul mito colore-CTA / Von Restorff: analisi rigorose che smontano i "button color test" (es. Atticus Li), coerenti col consenso NN/G.

*Le percentuali puntuali che circolano su blog di settore e agenzie sono state volutamente **non** riportate come dati:
dove citate a voce, trattarle come ordine di grandezza, non come misure.*
