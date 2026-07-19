# strumenti/blog — la fabbrica articoli

Come `strumenti/ricerca/` per le aziende: gli articoli li scrivono sessioni agente,
Ray cura e committa. Il repo è il CMS (un articolo = un file MDX in `contenuti/blog/`).

## File

- **`LINEE-EDITORIALI.md`** — la voce del sito, le regole ferree, i numeri golden ammessi.
  Leggilo prima di scrivere qualsiasi cosa.
- **`PROMPT-articolo.md`** — prompt parametrico. Riempi i parametri, l'output **è** il file
  `.mdx` completo (`stato: bozza`), pronto per `contenuti/blog/`.

## Flusso in breve

1. Scegli una query dal piano (cluster: fisco / guide / flotte / mestieri).
2. `PROMPT-articolo.md` in una sessione → salvi l'MDX in `contenuti/blog/«slug».mdx`.
3. Revisione umana (numeri veri, tono, zero fornitori).
4. `stato: pubblicato` → `npm run check:blog` → commit → deploy.

Le bozze non compaiono in build, indice, sitemap o RSS: nessuna fretta di pubblicare.
