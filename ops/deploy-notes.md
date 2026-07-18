# Note operative — deploy

Il deploy di produzione è su Vercel (progetto `automotive`), agganciato a GitHub `main`.

## Se un push non triggera il deploy
Se dopo un push su `main` Vercel non crea una nuova build (resta su un commit vecchio),
il webhook GitHub→Vercel non è scattato. Rimedi:

1. **Commit nativo GitHub** (via API/web UI) su `main`: fa ripartire il webhook.
2. **Vercel → Settings → Git → Disconnect/Connect** del repo: ristabilisce il webhook
   e fa partire un deploy dell'ultimo commit. Ripara anche i push futuri.

> Nota: il pulsante "Redeploy" ri-esegue la STESSA build (stesso commit), non pesca
> i commit più recenti.
