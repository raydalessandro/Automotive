import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { SITE, siteUrl } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UtmCapture } from "@/components/UtmCapture";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.nome} — Noleggio a lungo termine per partite IVA`,
    template: `%s · ${SITE.nome}`,
  },
  description: SITE.descrizione,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE.nome,
    title: `${SITE.nome} — Noleggio a lungo termine per partite IVA`,
    description: SITE.descrizione,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <UtmCapture />
        <Analytics />
      </body>
    </html>
  );
}
