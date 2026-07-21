import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Impero Vendita",
  description: "I tuoi contatti da chiudere.",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#12100D",
  width: "device-width",
  initialScale: 1,
};

// Layout minimale della PWA venditori: nessuna nav della dashboard, mobile-first,
// colonna singola. Il venditore non vede il sistema, solo i suoi contatti.
export default function VenditaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-avorio">
      <header className="sticky top-0 z-10 border-b border-oro/15 bg-nero text-testo-scuro">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <span className="font-display text-lg font-semibold tracking-wide">
            Impero <span className="text-oro">Vendita</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
    </div>
  );
}
