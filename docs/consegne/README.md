# Consegne — protocollo di lavoro

Divisione dei ruoli: **spec e review** vivono qui e nella chat di regia; **Opus implementa
una consegna alla volta**. Ogni consegna è autosufficiente: dice cosa fare, cosa è vietato,
e come si misura "finito".

## Loop per Opus

1. Leggi la consegna PR-N e le spec che cita. Non lavorare in anticipo sulle successive.
2. Branch `feat/pr<N>-<nome>` da main aggiornato.
3. Implementa SOLO ciò che la consegna elenca. I "Vietato" sono vietati.
4. `npm test` verde e criteri di accettazione spuntati uno a uno.
5. Apri la PR verso main col titolo indicato, incolla la checklist spuntata nella
   descrizione, e FERMATI: si prosegue solo dopo il merge.

## Review (chat di regia)

Per ogni PR: fetch del branch → `npm test` → criteri della consegna uno a uno → scan del
diff sulle superfici vietate → migrations solo additive → verdetto: merge o richieste.
Nessuna PR salta la fila: l'ordine è quello di `docs/piano-implementazione.md`.

## Regole trasversali

- DB: le migration si scrivono nelle PR ma si **applicano solo al deploy**, su decisione
  dell'operatore. Ogni consegna dichiara se ne contiene.
- Stile: riusare componenti e convenzioni esistenti (commenti in italiano, file piccoli,
  nessuna libreria nuova senza ok esplicito).
- PR-1 non ha consegna: è il branch `ricerca-agente` già pronto (docs, batch, script, skill).
- PR-6 (crocette del "perso") riceverà la sua consegna dopo il merge della PR-4.
