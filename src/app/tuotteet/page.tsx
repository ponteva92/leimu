import type { Metadata } from "next";
import { TuotteetClient } from "./TuotteetClient";

export const metadata: Metadata = {
  title: "Tuotteet",
  description:
    "Tutki LEIMU-kynttilöiden tuoksuja interaktiivisella tuoksukartastolla. Konfiguroi oma kynttilä — valitse purkki, tuoksu ja viesti.",
};

export default function TuotteetPage() {
  return <TuotteetClient />;
}
