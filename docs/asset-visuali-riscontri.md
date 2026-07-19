# Riscontri per asset visivi

## Repository

Il repository `raydalessandro/Automotive` è un progetto Next.js 14 con Tailwind. La homepage pubblica usa un hero scuro, palette nero/oro/avorio e una firma grafica vettoriale (`LineaVeicoli`), senza fotografia. Le landing di segmento condividono un hero scuro a due colonne con un calcolatore; l'attuale componente non prevede ancora un supporto fotografico.

La cartella pubblica contiene al momento solo `placeholder-veicolo.svg` e `public/img/veicoli/`, la cui convenzione è riservata alle immagini di singoli veicoli (WebP 1200×900). Le fotografie editoriali del brief richiedono quindi una nuova directory dedicata, separata da quelle del catalogo.

## Destinazione pubblicata

Il collegamento di deployment riportato nella pagina del repository, `https://automotive-mu-five.vercel.app/`, al controllo del 19 luglio 2026 restituisce `404 DEPLOYMENT_NOT_FOUND`. Non è quindi disponibile un riferimento visuale live; l'allineamento verrà fatto rispetto ai token e ai componenti presenti nel repository.

## Implicazione progettuale

Le nuove fotografie devono preservare aree negative sicure per copy e CTA, senza duplicare né sostituire i visual vettoriali esistenti. Per evitare conflitti con le foto catalogo dei veicoli, saranno organizzate sotto `public/foto/` con denominazioni semantiche e schede di impiego.

## Verifica visiva — lotto 1

`foto-hero.webp` è una fotografia 16:9 nitida e coerente con il tono professionale: il soggetto è distinguibile e il veicolo privo di badge evidenti. La composizione concentra l'uomo a sinistra e il van a destra; è quindi adatta a un layout affiancato o a un hero con copy sovrapposto su una fascia scura aggiuntiva, non a testo chiaro direttamente sul volto.

`foto-chiavi.webp` presenta un passaggio di chiavi leggibile, mani anatomicamente credibili, nessun testo e un contrasto caldo/scuro coerente con la palette. L'inquadratura consente una resa efficace come immagine di sezione 3:2.

## Verifica visiva — lotto 2

`foto-tranquillita.webp` rappresenta correttamente una professionista serena in un ambiente ordinato. La luce è morbida, la palette chiara coerente e il lato sinistro è sufficientemente libero per supportare una colonna copy; non sono presenti testo o marchi.

`foto-flotta.webp` mostra tre mezzi commerciali puliti in un contesto esterno ordinato. Le carrozzerie sono senza badge leggibili, l'illuminazione calda rimane discreta e il soggetto comunica scala gestionale senza la retorica da concessionaria.

## Verifica visiva — lotto 3

`foto-artigiano.webp` conserva un contesto artigianale credibile e ordinato, con un furgone senza logotipi leggibili. La resa è più concreta che patinata e può funzionare bene in una sezione con testo a lato.

`foto-agente.webp` mostra un professionista in abito formale che sale su una berlina senza badge visibili. La scena comunica mobilità e routine professionale, con una luce urbana calda e una composizione coerente per una landing dedicata.

## Verifica visiva — lotto 4

`foto-studio.webp` è una scena istituzionale pulita, con materiali caldi e dettagli in ottone usati con misura. Il locale è privo di persone, loghi e ingombri ed è coerente con la promessa di uno studio di consulenza.

`foto-materia.webp` restituisce una macro astratta credibile di ottone spazzolato, nero opaco e avorio. Il risultato è sobrio, privo di testo e adatto come texture o come transizione di sezione; l'oro funziona come dettaglio materico e non come superficie dominante.

## Verifica visiva — lotto 5

`foto-consulenza.webp` mostra una conversazione reale, concentrata su un documento, senza strette di mano, sorrisi stereotipati o logotipi. La luce naturale e l'arredamento minimale mantengono il tono da consulenza dedicata.

`foto-sfondo.webp` offre una superficie molto scura con riflessi dorati delicati, senza elementi competitivi con il contenuto. Lo spazio centrale e destro è idoneo a testo chiaro o oro con adeguato contrasto.
