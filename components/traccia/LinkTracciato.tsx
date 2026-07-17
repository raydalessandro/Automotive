"use client";

import { traccia } from "@/lib/traccia";
import type { TipoEvento } from "@/lib/eventi/schema";

// Link <a> che traccia un evento al click (telefono/whatsapp/condividi).
export function LinkTracciato({
  tipo,
  href,
  veicoloId,
  className,
  target,
  rel,
  children,
}: {
  tipo: TipoEvento;
  href: string;
  veicoloId?: string;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={() => traccia(tipo, { veicolo_id: veicoloId })}
    >
      {children}
    </a>
  );
}
