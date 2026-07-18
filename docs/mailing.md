# Motore d'invio campagne — attivazione

Il motore è costruito e testato, ma **parte solo quando è tutto configurato** (§4/§8 spec).
Finché manca la config, le campagne restano in `bozza` e il cron è un no-op.

## Cosa serve per attivare gli invii

1. **Dominio d'invio dedicato** (mai il dominio del sito) con SPF/DKIM/DMARC configurati su Resend.
   Env: `MAIL_FROM="Impero Automotive <info@dominio-invio.it>"`.
2. **`RESEND_API_KEY`** valorizzata.
3. **`CRON_SECRET`**: segreto che protegge l'endpoint cron. Vercel lo invia come
   `Authorization: Bearer <CRON_SECRET>` alle chiamate cron. Senza, il cron è disabilitato.
4. (opzionale) **`TETTO_GLOBALE_GIORNO`** — default 50.
5. Casella **reply-to** del venditore per leggere le risposte `[APERTO]`.

## Come funziona

- **Cron**: `vercel.json` schedula `/api/cron/invii`. **Su Hobby Vercel ammette solo cron
  giornalieri**, quindi lo schedule è `0 8 * * *` (una volta al giorno, ~09:00 ora italiana,
  dentro la finestra). Passando a **Pro** si può alzare a `*/30 * * * *` (ogni 30 min) per uno
  spread migliore. L'endpoint invia solo nella finestra **8:30–18:00 lun–ven (ora italiana)**;
  fuori finestra è un no-op.
- Preleva gli `invii` `in_coda` con `pianificato_il <= now`, solo di campagne **attive**,
  verso aziende con email e non in `opt_out`.
- Rispetta il **tetto giornaliero per campagna** e il **tetto globale**. Batch piccoli per run
  (max 10) con jitter tra invii: niente burst; lo spread reale è dato dalla cadenza del cron.
- Ogni email ha link con UTM (`utm_source=email`, `utm_campaign={nome}`), firma e footer
  **opt-out** (`/api/opt-out?token=`): un click → azienda `opt_out`, mai più selezionata.

> Nota Vercel: i cron **sub-giornalieri richiedono il piano Pro**. Su Hobby lo schedule deve
> essere giornaliero (come qui `0 8 * * *`), altrimenti Vercel **rifiuta il deployment**.
> In alternativa l'endpoint resta invocabile da uno scheduler esterno.

## Flusso operativo

1. Importa aziende in `/app/aziende` (stato `da_contattare`).
2. Crea una campagna, scrivi oggetto/corpo con segnaposto, **Accoda destinatari**
   (crea gli `invii` distribuiti sui giorni col tetto).
3. Quando dominio ed env sono pronti, porta la campagna su **attiva**: il cron inizia a inviare.
4. Le risposte si leggono nella casella reply-to e si marcano in `/app/campagne/[id]`.
