"use client";

import Link from "next/link";
import { tracciaCta } from "@/lib/traccia";
import type { CtaId } from "@/lib/traccia/cta";

// Link che emette cta_click con un id registrato (§PR29). Nessuna dedup: ogni click conta.
export function CtaLink({
  cta,
  href,
  className,
  children,
}: {
  cta: CtaId;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => tracciaCta(cta)}>
      {children}
    </Link>
  );
}
