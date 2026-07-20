import Image from "next/image";
import { iniziali } from "@/lib/team";

// Avatar tondo con anello oro sottile. Con `foto` mostra lo scatto; senza, il
// segnaposto a iniziali (cerchio grafite, iniziali Fraunces oro) — §3 spec.
// Il build non dipende dai file foto: se `foto` è assente si va di iniziali.
export function Avatar({
  nome,
  foto,
  size = 64,
  className = "",
}: {
  nome: string;
  foto?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-grafite ring-1 ring-oro/60 ${className}`}
      style={{ width: size, height: size }}
    >
      {foto ? (
        <Image src={foto} alt={nome} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span
          className="font-display font-semibold leading-none text-oro"
          style={{ fontSize: Math.round(size * 0.38) }}
          aria-hidden="true"
        >
          {iniziali(nome)}
        </span>
      )}
    </span>
  );
}
