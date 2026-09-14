"use client";

import { useState } from "react";
import { CONTACTS } from "@/lib/contacts";
import { COPY } from "@/lib/copy";
import type { Lang, PaymentMethod } from "@/types";

export function PaymentDetails({
  lang,
  method,
  compact = false,
}: {
  lang: Lang;
  method?: PaymentMethod | "";
  compact?: boolean;
}) {
  const showCash = !method || method === "cash";
  const showPay = !method || method === "mobilepay" || method === "siirto";

  return (
    <div className={compact ? "space-y-2 text-sm text-[var(--ink-soft)]" : "space-y-3 text-sm text-[var(--ink-soft)]"}>
      {showCash && method === "cash" && (
        <p>{COPY.checkout.cash[lang]}</p>
      )}
      {showPay && (method === "mobilepay" || !method) && (
        <p>
          MobilePay: <CopyPhone />
        </p>
      )}
      {showPay && (method === "siirto" || !method) && (
        <p>
          Siirto: <CopyPhone />
        </p>
      )}
      {method === "" && showCash && <p>{COPY.checkout.cash[lang]}</p>}
      <p className="tag-mono text-[8px] leading-relaxed text-[var(--ink-mute)]">
        {COPY.checkout.payHint[lang]}
      </p>
    </div>
  );
}

function CopyPhone() {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="font-mono text-[var(--ink)] underline-offset-2 hover:underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(CONTACTS.payPhoneTel);
          setOk(true);
          window.setTimeout(() => setOk(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {CONTACTS.payPhone}{ok ? " ✓" : ""}
    </button>
  );
}
