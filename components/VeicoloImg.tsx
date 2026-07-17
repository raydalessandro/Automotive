"use client";

import { useState } from "react";

// Immagine veicolo con fallback al placeholder brandizzato (§2.3): il sito non si rompe mai.
export function VeicoloImg({
  src,
  alt,
  className = "",
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [errore, setErrore] = useState(false);
  const finale = errore ? "/placeholder-veicolo.svg" : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finale}
      alt={alt}
      className={className}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      onError={() => setErrore(true)}
    />
  );
}
