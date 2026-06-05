import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "LEIMU — Käsintehtyjä soijavahakynttilöitä Suomesta",
  description:
    "LEIMU valmistaa käsintehtyjä, pieneräisiä soijavahakynttilöitä sheabutterilla Oulussa. Raikas havu, lämmin vanilja, suomalainen mustikka — tilaa omasi jo 9 €.",
  keywords: [
    "soijavahakynttilä",
    "käsintehtyjä kynttilöitä",
    "tuoksukynttilä",
    "kynttilä lahja",
    "ekologinen kynttilä",
    "sheabutter kynttilä",
    "pieneriä kynttilä",
    "suomalainen kynttilä",
  ],
  openGraph: {
    title: "LEIMU — Käsintehtyjä soijavahakynttilöitä",
    description:
      "Havu, vanilja, mustikka. Jokainen LEIMU on käsityö — 100% soijavahaa ja sheabutteria, valmistettu Oulussa.",
    images: ["/images/launch-kuva.png"],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
