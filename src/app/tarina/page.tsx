import type { Metadata } from "next";
import { TarinaClient } from "./TarinaClient";

export const metadata: Metadata = {
  title: "Tarinamme — LEIMU by Shane",
  description:
    "LEIMUn tarina: filippiiniläinen sairaanhoitaja Shane muutti Suomeen 2024 ja loi käsintehtyjä soijavahakynttilöitä sheabutterilla Oulussa. Ekologinen, eettinen, yksinkertaisesti kaunis.",
  keywords: [
    "LEIMU tarina",
    "kynttilöiden valmistus",
    "soijavaha Suomi",
    "käsintehtyjä kynttilöitä",
    "sheabutter kynttilä",
    "ekologinen kynttilä",
    "pieneriä kynttilät",
    "Shane LEIMU",
  ],
  openGraph: {
    title: "Tarinamme — LEIMU by Shane",
    description:
      "Filippiiineiltä Suomeen — kuinka LEIMU-kynttilät syntyivät. Käsityötä, soijavahaa ja sydäntä.",
  },
};

export default function TarinaPage() {
  return <TarinaClient />;
}
