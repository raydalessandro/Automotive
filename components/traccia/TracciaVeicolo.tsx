"use client";

import { useEffect } from "react";
import { traccia } from "@/lib/traccia";

// Traccia l'apertura di una scheda veicolo (§5).
export function TracciaVeicolo({ id }: { id: string }) {
  useEffect(() => {
    traccia("veicolo_visto", { veicolo_id: id });
  }, [id]);
  return null;
}
