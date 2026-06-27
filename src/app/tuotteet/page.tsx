import type { Metadata } from "next";
import { TuotteetClient } from "./TuotteetClient";

export const metadata: Metadata = {
  title: "Tuotteet",
  description:
    "Kokoa oma LEIMU-tilauksesi: valitse purkki, tuoksut ja käsinkirjoitettu viesti. Jokaiseen tilaukseen kuuluu musta kiitoskortti kultaisella vahasinetillä — täydellinen lahja tai oma hetki. Käsintehtyä Oulussa, alkaen 9 €.",
  keywords: [
    "kynttilä lahja",
    "yrityslahja kynttilä",
    "pikkujoululahja",
    "soijavahakynttilä",
    "käsintehty kynttilä",
    "vahasinetti",
    "henkilökohtainen viesti",
    "Oulu",
  ],
  alternates: { canonical: "/tuotteet" },
  openGraph: {
    title: "Tuotteet — Kokoa oma LEIMU-tilauksesi",
    description:
      "Valitse purkki, tuoksut ja käsinkirjoitettu viesti. Mukana musta kiitoskortti kultaisella LEIMU-vahasinetillä.",
    images: [
      {
        url: "/images/kortti.png",
        width: 922,
        height: 676,
        alt: "Musta kirjekuori, jonka sulkee kultainen LEIMU Candles -vahasinetti",
      },
    ],
  },
};

export default function TuotteetPage() {
  return <TuotteetClient />;
}
