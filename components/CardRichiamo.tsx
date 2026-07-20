import { Avatar } from "./Avatar";
import { RICHIAMO } from "@/lib/team";

// Card richiamo (§2 spec): i volti di chi ti richiama nei punti di conversione.
// Avatar affiancati (segnaposto a iniziali finché mancano le foto) + testo fisso.
// `scuro` per i fondi neri; `compatta` (senza box) per dentro il metodo home;
// `className` per lo spazio attorno.
export function CardRichiamo({
  scuro = false,
  compatta = false,
  className = "",
}: {
  scuro?: boolean;
  compatta?: boolean;
  className?: string;
}) {
  const testo = scuro ? "text-testo-scuro/85" : "text-testo-chiaro/75";
  const box = scuro
    ? "border-oro/25 bg-nero/40"
    : "border-oro/25 bg-oro/5";

  // Variante compatta: niente box, avatar + testo centrati (passo 3 del metodo).
  if (compatta) {
    return (
      <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
        <div className="flex items-center">
          {RICHIAMO.map((c, i) => (
            <Avatar key={c.nome} nome={c.nome} foto={c.foto} size={44} className={i > 0 ? "-ml-3" : ""} />
          ))}
        </div>
        <p className={`text-sm ${testo}`}>
          Ti richiama <strong className={scuro ? "text-testo-scuro" : "text-testo-chiaro"}>Shery</strong> o{" "}
          <strong className={scuro ? "text-testo-scuro" : "text-testo-chiaro"}>Ahmed</strong> — persone
          vere, in giornata.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 ${box} ${className}`}>
      <div className="flex shrink-0 items-center">
        {RICHIAMO.map((c, i) => (
          <Avatar
            key={c.nome}
            nome={c.nome}
            foto={c.foto}
            size={44}
            className={i > 0 ? "-ml-3" : ""}
          />
        ))}
      </div>
      <p className={`text-sm ${testo}`}>
        Ti richiama <strong className={scuro ? "text-testo-scuro" : "text-testo-chiaro"}>Shery</strong> o{" "}
        <strong className={scuro ? "text-testo-scuro" : "text-testo-chiaro"}>Ahmed</strong> — persone vere,
        in giornata.
      </p>
    </div>
  );
}
