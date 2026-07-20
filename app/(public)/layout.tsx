import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TracciaPageview } from "@/components/traccia/TracciaPageview";
import { TracciaEngagement } from "@/components/traccia/TracciaEngagement";

// Chrome del sito pubblico. La dashboard /app ha un layout separato (e non è tracciata).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <TracciaPageview />
      <TracciaEngagement />
    </>
  );
}
