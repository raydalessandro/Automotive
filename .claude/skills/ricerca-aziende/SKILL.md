---
name: ricerca-aziende
description: Agente di ricerca e arricchimento del magazzino aziende (noleggio lungo termine B2B). Usare quando si vuole cercare nuove aziende target (artigiani, PMI, manutenzione impianti a contratto), arricchire righe grezze, validare batch prodotti da worker esterni (Kimi, ChatGPT, Grok, ...) o importarli in Supabase. Copre query per settore e densità, regole email/P.IVA, gate di qualità e ciclo di import.
---

# Agente ricerca aziende

Sei l'orchestratrice del magazzino aziende. Fonti di verità, da leggere prima di agire:
- `strumenti/ricerca/PATTERN-settori.md` — i 3 assi, i keyword-set, la matrice densità, gli anti-pattern, il protocollo di fiducia.
- `strumenti/ricerca/PROMPT-raccolta.md` e `PROMPT-arricchimento.md` — i prompt canonici del ciclo.
- `strumenti/ricerca/PROMPT-worker-esterno.md` — il brief da consegnare ad AI esterne.
- `strumenti/ricerca/README.md` — il ciclo completo (raccolta → import → export → arricchimento → re-import).

## Modalità 1 — Raccolta diretta (l'agente cerca da sé)

1. Parametri: KEYWORD_SET, AREA, OBIETTIVO, BATCH_ID = `batch-<keyword>-<prov>-<nn>`.
2. Query: `manutenzione <servizio> <città> azienda`. Servizi diffusi → metropoli; nicchia
   (ascensori, antincendio, cancelli) → capoluoghi piccoli. Per gli agenti di commercio: solo
   directory di associazioni. Mai marketplace, mai reti multi-dominio "h24".
3. Per ogni azienda: apri il sito e **leggi fino al footer** (P.IVA e ragione sociale completa
   stanno lì per legge). Cerca la pagina "i nostri numeri": flotta e tecnici dichiarati sono il
   segnale Asse 1 in forma pura.
4. Email: SOLO caselle generiche (info@, contatti@, commerciale@, amministrazione@, preventivi@)
   sul dominio aziendale, lette su una pagina reale. Mai nominali, mai dedotte, mai PEC, mai
   troncate, mai gmail/domini consumer. Nel dubbio: null.
5. Campi: `segnali` è UNA stringa; `dimensione_stimata` ∈ {"1","2-9","10-30","31+"};
   `fonte_ricerca` = BATCH_ID; score 0-5 secondo la rubrica del PROMPT-raccolta.
6. Salva in `strumenti/ricerca/batch/<BATCH_ID>.json` (array JSON puro).

## Modalità 2 — Gate su batch di worker esterni

Ogni consegna di un worker passa dal gate PRIMA dell'import:

```bash
npm run aziende:gate -- --file strumenti/ricerca/batch/<file>.json
```

Il gate esegue: parser+schema, dedup interno e quasi-doppioni vs batch esistenti (nome
normalizzato: "S.r.l." ≈ "Srl"), checksum P.IVA (più KO = worker che inventa), coerenza
dominio email/sito, caselle non generiche. Poi:
- email a dominio coincidente da worker affidabile → restano;
- email incoerenti o non generiche → azzerarle e annotare in `segnali` "(da rileggere)";
- righe senza sito né telefono né P.IVA → **quarantena**, non si importano;
- quasi-doppioni → arricchire la riga esistente (fill dei campi vuoti), non duplicare;
- 1 fetch di verifica sulla riga migliore del batch chiude il protocollo di fiducia.

## Modalità 3 — Import e misura

```bash
npm run aziende:importa -- --file strumenti/ricerca/batch/<file>.json --modalita raccolta
npm run aziende:esporta -- --stato grezza --segmento <seg> --provincia <XX> --out auto   # per l'arricchimento
```

Richiede `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. La resa per keyword-set
si misura con la query SQL in PATTERN-settori.md (raggruppa su `fonte_ricerca`).

## Regole non negoziabili (valgono su tutto)

Mai PEC, mai email personali o nominali, mai dati inventati o dedotti. Un campo vuoto si
arricchisce domani; un'email sbagliata brucia il dominio d'invio oggi. I file in `batch/` si
committano: sono l'audit trail delle sessioni di ricerca.

## Modalità 4 — Primo contatto

`npm run aziende:contatti` genera `strumenti/ricerca/contatti/lista-tiro.md`: per ogni azienda
il canale (email / telefono / da arricchire), il gancio estratto dai segnali e il messaggio
pronto. Regole e razionale in `docs/primo-contatto.md`. Alla risposta si passa a voce: il
venditore richiama entro 30 minuti. La skill serve anche a rifornire la lista: 2 batch di
raccolta al giorno tengono il ritmo di 30-50 contatti/giorno.
