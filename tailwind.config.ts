import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design token — §8 della spec. L'oro è un metallo prezioso: poco, mai superficie.
        nero: "#12100D", // fondo hero/footer — mai nero puro
        grafite: "#26231E",
        avorio: "#F6F3EC", // fondo sezioni contenuto: il sito respira in chiaro
        carta: "#FFFFFF",
        oro: "#B08D4F", // accenti: prezzi finali, filetti, monogramma
        "oro-chiaro": "#D6BC8A", // hover, dettagli su fondo scuro
        "testo-chiaro": "#2B2925", // testo su fondo chiaro
        "testo-scuro": "#F2EEE6", // testo su fondo scuro
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
      maxWidth: {
        content: "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
