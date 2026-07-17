import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UtmCapture } from "@/components/UtmCapture";

// Chrome del sito pubblico. La dashboard /app ha un layout separato.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <UtmCapture />
    </>
  );
}
