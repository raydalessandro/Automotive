# Foto veicoli

Convenzione path (§2.3 spec): `public/img/veicoli/{id}.webp`, 1200×900 (4:3), webp.

Regole:
- **Mai** le locandine del fornitore (brand rent.it). Solo foto pulite del veicolo:
  foto stampa della casa o ritaglio del solo veicolo, fondo neutro.
- Quando la foto reale è disponibile, salvala come `{id}.webp` qui e aggiorna
  il campo `foto` del veicolo in `data/catalogo.json` da `/placeholder-veicolo.svg`
  a `/img/veicoli/{id}.webp`.
- Se un veicolo non ha ancora foto, lascia `foto: "/placeholder-veicolo.svg"`:
  il validatore lo accetta e il sito mostra il placeholder brandizzato.
