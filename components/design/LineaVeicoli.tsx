// "Una sola linea": un unico path SVG disegna furgone, berlina e SUV.
// Metafora della promessa (un canone, tutto incluso) e firma visiva del brand.
// L'animazione di disegno è solo CSS (.linea-disegna) e rispetta prefers-reduced-motion.

const TRACCIATO =
  "M -20 410 L 150 410 a 22 22 0 1 1 0.6 0 L 296 410 a 22 22 0 1 1 0.6 0 " +
  "L 360 410 C 374 410 380 398 380 382 C 380 352 372 338 350 334 C 342 332 338 330 334 318 " +
  "C 328 292 318 262 296 256 C 288 254 280 252 268 252 L 158 252 C 128 252 114 264 111 290 " +
  "L 106 396 C 105 404 102 410 92 410 L 560 410 L 618 410 a 22 22 0 1 1 0.6 0 " +
  "L 788 410 a 22 22 0 1 1 0.6 0 L 856 410 C 872 410 879 400 877 386 C 874 362 858 352 830 348 " +
  "C 806 344 794 340 782 320 C 770 300 752 292 722 290 L 672 290 C 634 292 606 302 590 328 " +
  "C 581 342 578 366 578 392 C 578 402 574 410 564 410 L 1040 410 L 1100 410 a 22 22 0 1 1 0.6 0 " +
  "L 1268 410 a 22 22 0 1 1 0.6 0 L 1334 410 C 1350 410 1357 398 1355 380 C 1352 354 1340 344 1318 340 " +
  "C 1310 338 1304 336 1300 328 C 1292 302 1282 294 1256 292 L 1152 288 C 1114 288 1092 298 1078 320 " +
  "C 1067 336 1063 364 1063 390 C 1063 400 1059 410 1049 410 L 1420 410";

export function LineaVeicoli({
  className = "",
  anima = true,
}: {
  className?: string;
  anima?: boolean;
}) {
  const classePath = anima ? "linea-disegna" : "";
  return (
    <svg
      viewBox="0 190 1400 300"
      className={className}
      aria-hidden="true"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="linea-oro" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8D5A4" />
          <stop offset="0.5" stopColor="#C9A96B" />
          <stop offset="1" stopColor="#8F6D3C" />
        </linearGradient>
        <filter id="linea-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* filo di terra, appena percettibile */}
      <line x1="0" y1="410" x2="1400" y2="410" stroke="#B08D4F" strokeWidth="0.4" opacity="0.18" />

      {/* bagliore */}
      <path
        d={TRACCIATO}
        pathLength={1}
        className={classePath}
        stroke="#C9A96B"
        strokeWidth="6"
        opacity="0.28"
        filter="url(#linea-glow)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* la linea */}
      <path
        d={TRACCIATO}
        pathLength={1}
        className={classePath}
        stroke="url(#linea-oro)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* fanali */}
      <circle cx="371" cy="356" r="3.2" fill="#F4E3B8" />
      <circle cx="867" cy="368" r="3.2" fill="#F4E3B8" />
      <circle cx="1346" cy="362" r="3.2" fill="#F4E3B8" />
    </svg>
  );
}
