// La ruota guilloché: il pneumatico è la linea, il cerchione una rosetta da banconota.
// Usi: sigillo nel footer, spinner (prop spin), emblema. Tutta in currentColor.

const PETALI_ESTERNI = Array.from({ length: 12 }, (_, i) => i * 15);
const PETALI_INTERNI = Array.from({ length: 12 }, (_, i) => 7.5 + i * 15);

export function RuotaGuilloche({
  className = "",
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg viewBox="-110 -110 220 220" className={className} aria-hidden="true" fill="none">
      <g className={spin ? "ruota-lenta" : undefined} stroke="currentColor">
        {/* pneumatico: la linea */}
        <circle r="100" strokeWidth="2.4" />
        <circle r="92" strokeWidth="0.7" opacity="0.55" />
        {/* cerchione: l'incisione */}
        <g strokeWidth="0.55" opacity="0.5">
          {PETALI_ESTERNI.map((a) => (
            <ellipse key={a} rx="82" ry="26" transform={`rotate(${a})`} />
          ))}
        </g>
        <g strokeWidth="0.5" opacity="0.35">
          {PETALI_INTERNI.map((a) => (
            <ellipse key={a} rx="58" ry="17" transform={`rotate(${a})`} />
          ))}
        </g>
        {/* mozzo */}
        <circle r="15" strokeWidth="0.9" />
        <circle r="3.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Filetto con diamante: il separatore tipografico della direzione incisione. */
export function Filetto({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 16" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <line x1="0" y1="8" x2="104" y2="8" strokeWidth="1" />
      <path d="M120 2 l6 6 -6 6 -6 -6 Z" strokeWidth="1" />
      <line x1="136" y1="8" x2="240" y2="8" strokeWidth="1" />
    </svg>
  );
}
