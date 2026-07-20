# Primo contatto — playbook

Il primo contatto è personalizzato e sul canale giusto per quell'azienda. La risposta passa
**a voce al venditore**: è lì che ci differenziamo da chi fa tutto online. Tutto ciò che serve
si genera con `npm run aziende:contatti` → `strumenti/ricerca/contatti/lista-tiro.md`.

## Matrice canale

Ogni riga del magazzino ha già il suo canale, deciso dai dati:
email generica presente → **email T1 personalizzata** (inviata a mano dal venditore, dalla sua
casella: 30-50 al giorno reggono e la deliverability ringrazia). Solo telefono → **chiamata**
con l'opener della lista. Cellulare (3xx) → variante **WhatsApp** (chiedere il permesso prima
di mandare il conto, mai link al primo messaggio). Né email né telefono → prima **arricchimento**,
poi contatto. LinkedIn: oggi non è nel magazzino; quando l'arricchimento aggiunge l'URL della
pagina aziendale nei segnali, il DM usa lo stesso testo della variante WhatsApp.

## Anatomia del messaggio (perché risponde)

1. **Gancio dal segnale** — la prima frase cita un dato LORO, raccolto dalla ricerca
   ("i 13 furgoni che dichiarate sul sito", "state cercando tecnici"). Dimostra che non è
   un invio di massa: è il motivo per cui il magazzino esiste.
2. **Il conto fiscale** — la leva giusta per il regime (Asse 2): N1 245→~177 € per l'ordinario,
   460→~301 € per gli agenti, costo certo/anticipo zero per i forfettari. Numeri dai golden test.
3. **Una sola CTA doppia** — un link alla landing di segmento + "risponda e la chiamo io".
4. **Uscita gentile** — una riga di opt-out umano.
Regole ereditate dalle sequenze: un solo link, niente allegati, niente maiuscole, mai "gratis".

## Calcolatore parametrico (per lo sviluppo in corso)

Non serve un calcolatore per settore: serve **per regime**. Convenzione URL da implementare in
`components/Calcolatore.tsx` (i valori combaciano con `FORME_GIURIDICHE` in `lib/lead/schema.ts`):

```
/calcolatore?forma=srl_spa|snc_sas|agente|ditta_individuale|forfettario&veicolo=n1|auto
```

Così ogni messaggio, articolo e partner porta al conto già impostato sul regime giusto, e i
settori restano solo un modo di trovare le aziende, non di moltiplicare gli strumenti.

## Cadenza e passaggio a voce

30-50 contatti/giorno per venditore. La lista attuale si consuma in circa una giornata: il
rifornimento è 2 batch di raccolta al giorno con la skill `ricerca-aziende`. Alla risposta
(email, WhatsApp o richiamata): stato → `risposto`, **telefonata entro 30 minuti in orario
ufficio**. Il follow-up di chi non risponde resta alle sequenze T2/T3 (`docs/sequenze-email.md`)
via motore campagne. Prossimo cerchio a costo zero, stesso schema: commercialisti e associazioni
(ANACAM e AssoAscensori sono già emerse dalla ricerca) con il calcolatore parametrico come
strumento da dare ai loro clienti.
