"use client";

import { useStore } from "@/context/store";

export function PurchaseNotes() {
  const lang = useStore((state) => state.lang);
  return (
    <aside className="purchase-notes" aria-label={lang === "fi" ? "Hyvä tietää ennen tilausta" : "Before you order"}>
      <p className="tag-mono">{lang === "fi" ? "Viimeistä yksityiskohtaa myöten." : "Considered, down to the last detail."}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <p><strong>{lang === "fi" ? "Lahjapussi ja oma viesti mukana." : "Gift bag and your message included."}</strong><br />{lang === "fi" ? "Käsinkirjoitettu, kultaisella vahasinetillä suljettu." : "Handwritten and closed with a golden wax seal."}</p>
        <p><strong>{lang === "fi" ? "Nouto tai postitus 8\u00a0€." : "Collection or postage for 8\u00a0€."}</strong><br />{lang === "fi" ? "Toimitus Oulun alueella tai postitse 5–7 arkipäivässä." : "Delivery in the Oulu area or by post in 5–7 working days."}</p>
      </div>
      <p>{lang === "fi" ? "Maksuohjeet saat tilauksen jälkeen. MobilePay ja Siirto; käteinen henkilökohtaisen toimituksen yhteydessä." : "Payment instructions follow your order. MobilePay and Siirto; cash for delivery in person."}</p>
    </aside>
  );
}
