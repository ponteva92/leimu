"use client";

import { COPY } from "@/lib/copy";
import { useStore } from "@/context/store";

export function StickyCartBar({ onProceed }: { onProceed: () => void }) {
  const { lang, cartTotalQty, cartTotalPrice, checkoutStep } = useStore();
  const qty = cartTotalQty();
  const price = cartTotalPrice();
  if (qty <= 0 || checkoutStep !== "configure") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 shadow-[0_-12px_40px_-18px_rgba(26,24,20,0.28)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="tag-mono text-[8px] text-[var(--ink-mute)]">
            {COPY.cart.bar[lang]} · {qty} {COPY.cart.candles[lang]}
          </p>
          <p className="font-serif text-2xl italic leading-none text-[var(--ink)]">{price}€</p>
        </div>
        <button
          type="button"
          onClick={onProceed}
          className="rounded-full bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bg)]"
        >
          {COPY.cart.continue[lang]} →
        </button>
      </div>
    </div>
  );
}
