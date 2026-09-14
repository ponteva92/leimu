"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/context/store";
import { SCENTS, PRICE_TABLE, flattenCart, scentById } from "@/lib/scents";
import { previewPrice, submitForm } from "@/lib/formSubmit";
import { COPY } from "@/lib/copy";
import { CONTACTS, EMAIL_RE } from "@/lib/contacts";
import { CandleSVG } from "@/components/CandleSVG";
import { ScentModal } from "@/components/ScentModal";
import { ScentCarousel } from "@/components/ScentCarousel";
import { PrivacyLink } from "@/components/PrivacyModal";
import { PaymentDetails } from "@/components/PaymentDetails";
import { StickyCartBar } from "@/components/StickyCartBar";
import type { Scent, JarColor, CartItem, CheckoutData, DeliveryMode, PaymentMethod, Lang } from "@/types";
import { ProductsHero } from "@/components/tuotteet/ProductsHero";
import { GiftCeremony } from "@/components/GiftCeremony";
import { Spinner } from "@/components/ui/Spinner";
import { SuccessCheck } from "@/components/ui/SuccessCheck";
import { EmptyState } from "@/components/ui/EmptyState";

const JAR_LABELS: Record<JarColor, { fi: string; en: string }> = {
  white: { fi: "Valkoinen", en: "White" },
  green: { fi: "Vihreä", en: "Green" },
  red:   { fi: "Punainen", en: "Red" },
};

const JAR_ADJ: Record<JarColor, { fi: string; en: string }> = {
  white: { fi: "Valkoisia", en: "White" },
  green: { fi: "Vihreitä", en: "Green" },
  red:   { fi: "Punaisia", en: "Red" },
};

const JAR_DOT: Record<JarColor, string> = {
  white: "bg-stone-300",
  green: "bg-[#5C7A48]",
  red:   "bg-[#8B2E2E]",
};

const emptyForm = (): CheckoutData => ({
  firstName: "", lastName: "", email: "",
  address: "", zip: "", city: "",
  delivery: "pickup",
  wantsPersonalMessage: false,
  personalMessage: "",
  paymentMethod: "",
});

function FluidBackground({ waxColor }: { waxColor: string | null }) {
  const color = waxColor ?? "transparent";
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      animate={{
        background: waxColor
          ? `radial-gradient(ellipse 130% 65% at 50% -5%, ${color}1e 0%, ${color}0a 40%, transparent 65%)`
          : "none",
        opacity: waxColor ? 1 : 0,
      }}
      transition={{ duration: 3, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5 border-b border-[var(--line)] last:border-0">
      <span className="tag-mono text-[8px] text-[var(--ink-mute)] flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--ink)] text-right">{value}</span>
    </div>
  );
}

function InputField({ id, label, type = "text", required = false, value, onChange, error }: {
  id: string; label: string; type?: string; required?: boolean;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="tag-mono block mb-2">{label}</label>
      <input
        id={id} type={type} required={required} value={value} onChange={onChange}
        aria-invalid={error ? true : undefined}
        className={[
          "w-full px-4 py-3 rounded-md border bg-[var(--bg)] text-[var(--ink)] text-sm transition-colors duration-base focus:outline-none",
          error
            ? "border-[var(--destructive)] focus:border-[var(--destructive)]"
            : "border-[var(--field-border)] focus:border-[var(--accent-2)]",
        ].join(" ")}
      />
      {error && (
        <p role="alert" className="font-mono text-[11px] tracking-[0.08em] text-[var(--destructive)] mt-1.5 leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}

function ProgressBar({ step, lang }: { step: string; lang: Lang }) {
  const steps = ["configure", "checkout", "summary"] as const;
  const labels = [
    COPY.checkout.steps.cart[lang],
    COPY.checkout.steps.details[lang],
    COPY.checkout.steps.summary[lang],
  ];
  const current = step === "thankyou" ? 2 : steps.indexOf(step as typeof steps[number]);
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= current ? "text-[var(--ink)]" : "text-[var(--ink-mute)]"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center tag-mono text-[8px] transition-colors ${i < current ? "bg-[var(--accent)] text-[var(--bg)]" : i === current ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-[var(--line)] text-[var(--ink-mute)]"}`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className="tag-mono text-[9px] hidden md:inline">{labels[i]}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-3 h-px w-10 transition-colors ${i < current ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function QuantityStepper({ scent }: { scent: Scent }) {
  const { config, setQuantity, totalQty, lang } = useStore();
  const qty = config.quantities[scent.id] ?? 0;
  const total = totalQty();
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--line)] last:border-0">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--line)]">
        <Image src={scent.image} alt={lang === "fi" ? scent.name : scent.nameEn} fill className="object-cover" sizes="56px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif italic text-base text-[var(--ink)] leading-tight truncate">{lang === "fi" ? scent.name : scent.nameEn}</p>
        <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5 truncate">{lang === "fi" ? scent.profile : scent.profileEn}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button type="button" onClick={() => setQuantity(scent.id, qty - 1)} disabled={qty === 0}
          aria-label="-"
          className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center hover:bg-[var(--bg-2)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none"><path d="M1 1h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="w-7 text-center">
          <span className="block font-serif text-xl italic text-[var(--ink)]">{qty}</span>
        </div>
        <button type="button" onClick={() => setQuantity(scent.id, qty + 1)} disabled={total >= 6}
          aria-label="+"
          className="w-11 h-11 rounded-full border border-[var(--accent)] bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] hover:bg-[var(--ink)] hover:border-[var(--ink)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function CartItemCard({ item, onRemove, lang }: { item: CartItem; onRemove: () => void; lang: Lang }) {
  const totalInItem = Object.values(item.quantities).reduce((s, q) => s + q, 0);
  const scentLine = SCENTS.filter((s) => (item.quantities[s.id] ?? 0) > 0)
    .map((s) => `${lang === "fi" ? s.name : s.nameEn} ×${item.quantities[s.id]}`)
    .join(", ");
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[var(--line)] last:border-0">
      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${JAR_DOT[item.jarColor]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-serif italic text-sm text-[var(--ink)]">
          {JAR_LABELS[item.jarColor][lang]} · {totalInItem} {COPY.cart.pcs[lang]}
        </p>
        <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">{scentLine}</p>
      </div>
      <button type="button" onClick={onRemove} aria-label={lang === "fi" ? "Poista" : "Remove"}
        className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors p-1 mt-0.5 flex-shrink-0">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

function PriceTable({ highlight }: { highlight: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>{Object.keys(PRICE_TABLE).map((n) => (
            <th key={n} className="tag-mono text-[10px] text-[var(--ink-mute)] font-normal pb-1 pr-3 text-left">{n}</th>
          ))}</tr>
        </thead>
        <tbody>
          <tr>{Object.values(PRICE_TABLE).map((p, i) => (
            <td key={i} className={`font-serif italic text-sm pr-3 ${i + 1 === highlight ? "text-[var(--accent-2)]" : "text-[var(--ink-mute)]"}`}>{p}€</td>
          ))}</tr>
        </tbody>
      </table>
    </div>
  );
}

function ConfigureStep({
  onProceed, onScentHover, onScentLeave,
}: {
  onProceed: () => void;
  onScentHover: (waxColor: string) => void;
  onScentLeave: () => void;
}) {
  const { lang, config, setJar, addToCart, cart, removeFromCart, totalQty, cartTotalQty, cartTotalPrice, openModal } = useStore();
  const currentQty = totalQty();
  const cartQty = cartTotalQty();
  const cartPrice = cartTotalPrice();
  const jars: JarColor[] = ["white", "green", "red"];

  return (
    <div>
      <ProgressBar step="configure" lang={lang} />

      <section className="mb-16">
        <h2 id="scent-row-heading" className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">
          {lang === "fi" ? <><span>Tutustu </span><em>tuoksuihin</em></> : <><span>Explore the </span><em>scents</em></>}
        </h2>
        <ScentCarousel
          labelledBy="scent-row-heading"
          onSelect={openModal}
          onHover={onScentHover}
          onLeave={onScentLeave}
        />
      </section>

      <div className="divider mb-16" />

      <div id="configurator" className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <p className="tag-mono mb-2">{lang === "fi" ? "Lisää koriin" : "Add to cart"}</p>
          <h2 className="heading-display text-3xl md:text-4xl mb-4 text-[var(--ink)]">
            {lang === "fi" ? <><span>Kokoa oma </span><em>tilauksesi</em></> : <><span>Build your </span><em>order</em></>}
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mb-6 leading-relaxed">{COPY.cart.rule[lang]}</p>

          <div className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mb-2">{COPY.cart.total[lang]}</p>
            <PriceTable highlight={cartQty} />
          </div>

          <div className="mb-8">
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mb-1">
              {lang === "fi" ? "Valitse purkin väri" : "Choose jar colour"}
            </p>
            <p className="text-[11px] leading-snug text-[var(--ink-soft)] mb-3">
              {lang === "fi"
                ? "Kaikki purkit ovat läpikuultavaa maitolasia (mattalasi)."
                : "All jars are translucent frosted milk glass."}
            </p>
            <div className="flex gap-3">
              {jars.map((jar) => (
                <button key={jar} type="button" onClick={() => setJar(jar)}
                  className={["flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                    config.jar === jar ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line)] hover:border-[var(--accent-3)]"].join(" ")}>
                  <div className="w-14 h-[4.5rem]"><CandleSVG jar={jar} animate={false} /></div>
                  <span className="tag-mono text-[8px] text-[var(--ink-soft)]">{JAR_LABELS[jar][lang]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="tag-mono text-[8px] text-[var(--ink-mute)]">
                {lang === "fi" ? "Valitse tuoksut" : "Choose scents"}
              </p>
              <span className={`tag-mono text-[10px] ${currentQty >= 6 ? "text-[var(--accent-2-strong)]" : "text-[var(--ink-mute)]"}`}>
                {currentQty}/6
              </span>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4">
              {SCENTS.map((scent) => <QuantityStepper key={scent.id} scent={scent} />)}
            </div>
          </div>

          <button type="button" onClick={() => { if (currentQty > 0) addToCart(config.jar, { ...config.quantities }); }} disabled={currentQty === 0}
            className="w-full py-3.5 bg-[var(--accent)] text-[var(--bg)] font-mono text-[10px] tracking-[0.15em] uppercase rounded-full hover:bg-[var(--ink)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
            {COPY.cart.add[lang]}
          </button>
        </div>

        <div className="md:sticky md:top-24">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <p className="tag-mono text-[9px]">{COPY.cart.bar[lang]}</p>
              <p className="tag-mono text-[9px] text-[var(--ink-mute)]">
                {cartQty} {COPY.cart.candles[lang]}
              </p>
            </div>
            <div className="px-6 min-h-[100px]">
              {cart.length === 0 ? (
                <EmptyState message={COPY.cart.empty[lang]} />
              ) : (
                cart.map((item) => (
                  <CartItemCard key={item.id} item={item} lang={lang} onRemove={() => removeFromCart(item.id)} />
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-[var(--line)] space-y-4">
              <div>
                <p className="tag-mono text-[8px] text-[var(--ink-mute)]">{COPY.cart.total[lang]}</p>
                <p className="font-serif text-3xl italic text-[var(--ink)]">
                  {cartQty > 0 ? `${cartPrice}€` : "0€"}
                </p>
              </div>
              <button type="button" onClick={onProceed} disabled={cart.length === 0}
                className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                {COPY.cart.proceed[lang]} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutStep({ formData, setFormData, onBack, onNext }: {
  formData: CheckoutData; setFormData: (d: CheckoutData) => void;
  onBack: () => void; onNext: () => void;
}) {
  const { lang } = useStore();
  const [emailError, setEmailError] = useState("");
  const field = (key: keyof CheckoutData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData({ ...formData, [key]: e.target.value }),
  });

  const setDelivery = (delivery: DeliveryMode) => {
    setFormData({
      ...formData,
      delivery,
      paymentMethod: delivery === "post" && formData.paymentMethod === "cash" ? "" : formData.paymentMethod,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(formData.email.trim())) {
      setEmailError(COPY.checkout.emailError[lang]);
      return;
    }
    setEmailError("");
    onNext();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg mx-auto">
      <ProgressBar step="checkout" lang={lang} />
      <button type="button" onClick={onBack} className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] flex items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {COPY.checkout.back[lang]}
      </button>
      <p className="tag-mono mb-2">{COPY.checkout.steps.details[lang]}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">
        {lang === "fi" ? <><span>Toimitus ja </span><em>tiedot</em></> : <><span>Delivery and </span><em>details</em></>}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["pickup", "post"] as DeliveryMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDelivery(mode)}
              className={[
                "rounded-xl border p-4 text-left transition-colors",
                formData.delivery === mode
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--line)] hover:border-[var(--accent-3)]",
              ].join(" ")}
            >
              <p className="font-serif italic text-[var(--ink)]">
                {mode === "pickup" ? COPY.checkout.pickup[lang] : COPY.checkout.post[lang]}
              </p>
              <p className="tag-mono text-[8px] mt-1 text-[var(--ink-mute)]">
                {mode === "pickup" ? COPY.checkout.pickupHint[lang] : COPY.checkout.postHint[lang]}
              </p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="first-name" label={COPY.checkout.firstName[lang]} required {...field("firstName")} />
          <InputField id="last-name" label={COPY.checkout.lastName[lang]} required {...field("lastName")} />
        </div>
        <InputField
          id="email"
          label={COPY.checkout.email[lang]} type="email" required
          value={formData.email}
          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (emailError) setEmailError(""); }}
          error={emailError}
        />
        {formData.delivery === "post" && (
          <>
            <InputField id="address" label={COPY.checkout.address[lang]} required {...field("address")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="zip" label={COPY.checkout.zip[lang]} required {...field("zip")} />
              <InputField id="city" label={COPY.checkout.city[lang]} required {...field("city")} />
            </div>
          </>
        )}
        <div className="flex items-start gap-3 pb-1">
          <input type="checkbox" id="personalMsg" checked={formData.wantsPersonalMessage}
            onChange={(e) => setFormData({ ...formData, wantsPersonalMessage: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[var(--accent)] cursor-pointer flex-shrink-0" />
          <label htmlFor="personalMsg" className="cursor-pointer">
            <p className="text-sm text-[var(--ink)]">{COPY.checkout.messageOpt[lang]}</p>
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5">{COPY.checkout.messageHint[lang]}</p>
          </label>
        </div>
        {formData.wantsPersonalMessage && (
          <div>
            <label htmlFor="personal-message" className="tag-mono text-[8px] text-[var(--ink-mute)] block mb-1.5">{COPY.checkout.messageLabel[lang]}</label>
            <textarea
              id="personal-message"
              value={formData.personalMessage}
              onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors duration-base resize-none leading-relaxed"
            />
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-1.5">{COPY.checkout.messageHelp[lang]}</p>
          </div>
        )}
        <div className="pt-4 border-t border-[var(--line)]">
          <button type="submit"
            className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200">
            {COPY.checkout.next[lang]} →
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function SummaryStep({
  cart, formData, setFormData, discountCode, setDiscountCode, discountApplied,
  setDiscountApplied, discountError, setDiscountError, pricedPreview, setPricedPreview,
  onBack, onConfirm, isSubmitting, submitError,
}: {
  cart: CartItem[];
  formData: CheckoutData;
  setFormData: (d: CheckoutData) => void;
  discountCode: string;
  setDiscountCode: (v: string) => void;
  discountApplied: boolean;
  setDiscountApplied: (v: boolean) => void;
  discountError: boolean;
  setDiscountError: (v: boolean) => void;
  pricedPreview: { total: number; basePrice: number; discountAmount: number; deliveryFee: number } | null;
  setPricedPreview: (v: { total: number; basePrice: number; discountAmount: number; deliveryFee: number } | null) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  submitError: boolean;
}) {
  const { lang } = useStore();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [payError, setPayError] = useState(false);
  const [pricing, setPricing] = useState(false);

  const colorCounts: Record<JarColor, number> = { white: 0, green: 0, red: 0 };
  const colorScents: Record<JarColor, Record<string, number>> = { white: {}, green: {}, red: {} };
  for (const item of cart) {
    for (const [scentId, qty] of Object.entries(item.quantities)) {
      colorCounts[item.jarColor] += qty;
      colorScents[item.jarColor][scentId] = (colorScents[item.jarColor][scentId] ?? 0) + qty;
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await previewPrice({
          items: flattenCart(cart),
          delivery: formData.delivery,
          code: discountApplied ? discountCode : undefined,
        });
        if (!cancelled) setPricedPreview(p);
      } catch {
        if (!cancelled) setPricedPreview(null);
      }
    })();
    return () => { cancelled = true; };
  }, [cart, formData.delivery, discountApplied, discountCode, setPricedPreview]);

  const handleApply = async () => {
    setPricing(true);
    try {
      const p = await previewPrice({
        items: flattenCart(cart),
        delivery: formData.delivery,
        code: discountCode,
      });
      setDiscountApplied(p.codeApplied);
      setDiscountError(false);
      setPricedPreview(p);
    } catch {
      setDiscountError(true);
      setDiscountApplied(false);
    } finally {
      setPricing(false);
    }
  };

  const confirm = () => {
    if (!formData.paymentMethod) {
      setPayError(true);
      return;
    }
    onConfirm();
  };

  const methods: PaymentMethod[] = formData.delivery === "pickup"
    ? ["mobilepay", "siirto", "cash"]
    : ["mobilepay", "siirto"];

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
      <ProgressBar step="summary" lang={lang} />
      <button type="button" onClick={onBack} className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] flex items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {COPY.checkout.back[lang]}
      </button>
      <p className="tag-mono mb-2">{COPY.checkout.review[lang]}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">{COPY.checkout.steps.summary[lang]}</h2>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
          <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-4">{COPY.checkout.contents[lang]}</p>
          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            return (
              <div key={color} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                  <p className="font-serif italic text-sm text-[var(--ink)]">
                    {JAR_ADJ[color][lang]} · {colorCounts[color]} {COPY.cart.pcs[lang]}
                  </p>
                </div>
                {SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0).map((s) => (
                  <p key={s.id} className="tag-mono text-[8px] text-[var(--ink-mute)] ml-5 leading-relaxed">
                    {lang === "fi" ? s.name : s.nameEn} ×{colorScents[color][s.id]}
                  </p>
                ))}
              </div>
            );
          })}
          <div className="mt-4 space-y-1">
            <Row label={COPY.cart.total[lang]} value={`${pricedPreview?.basePrice ?? "—"}€`} />
            {discountApplied && pricedPreview && (
              <Row label={`${COPY.checkout.discount[lang]}`} value={`-${pricedPreview.discountAmount}€`} />
            )}
            {formData.delivery === "post" && (
              <Row label={COPY.checkout.delivery[lang]} value="+8€" />
            )}
            <Row
              label={formData.delivery === "post" ? COPY.checkout.post[lang] : COPY.checkout.pickup[lang]}
              value={formData.delivery === "post" ? `${formData.city}` : CONTACTS.pickupCity}
            />
          </div>
          <div className="border-t border-[var(--line)] pt-4 mt-4 flex justify-between items-baseline">
            <span className="tag-mono text-[9px] text-[var(--ink-mute)]">{COPY.cart.total[lang]}</span>
            <span className="font-serif text-2xl italic text-[var(--ink)]">{pricedPreview?.total ?? "—"}€</span>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-2">{COPY.checkout.code[lang]}</p>
            {discountApplied ? (
              <p className="text-sm text-[var(--accent)]">{discountCode.toUpperCase()}</p>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(false); }}
                  className={["flex-1 px-4 py-3 rounded-md border bg-[var(--bg)] text-sm focus:outline-none",
                    discountError ? "border-[var(--destructive)]" : "border-[var(--field-border)] focus:border-[var(--accent-2)]"].join(" ")} />
                <button type="button" onClick={handleApply} disabled={pricing}
                  className="px-4 rounded-full border border-[var(--line)] tag-mono text-[9px]">
                  {COPY.checkout.apply[lang]}
                </button>
              </div>
            )}
            {discountError && (
              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--destructive)] mt-1.5">{COPY.checkout.codeBad[lang]}</p>
            )}
          </div>

          <div>
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-3">{COPY.checkout.payment[lang]}</p>
            <div className="space-y-2">
              {methods.map((m) => (
                <label key={m} className={[
                  "flex items-center gap-3 rounded-xl border p-3 cursor-pointer",
                  formData.paymentMethod === m ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line)]",
                ].join(" ")}>
                  <input type="radio" name="pay" checked={formData.paymentMethod === m}
                    onChange={() => { setFormData({ ...formData, paymentMethod: m }); setPayError(false); }}
                    className="accent-[var(--accent)]" />
                  <span className="text-sm text-[var(--ink)]">
                    {m === "mobilepay" ? COPY.checkout.mobilepay[lang] : m === "siirto" ? COPY.checkout.siirto[lang] : COPY.checkout.cash[lang]}
                  </span>
                </label>
              ))}
            </div>
            {payError && <p role="alert" className="text-sm text-[var(--destructive)] mt-2">{COPY.checkout.paymentNeed[lang]}</p>}
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
              <PaymentDetails lang={lang} method={formData.paymentMethod} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" id="privacyConsent" checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--accent)]" />
            <label htmlFor="privacyConsent" className="cursor-pointer text-sm text-[var(--ink-soft)] leading-snug">
              {lang === "fi" ? (
                <>Olen lukenut ja hyväksyn, että tiedot käsitellään{" "}
                  <PrivacyLink className="underline underline-offset-2 text-[var(--ink)] hover:text-[var(--accent-2)]">
                    {COPY.checkout.privacyLink.fi}
                  </PrivacyLink>{" "}mukaisesti
                </>
              ) : (
                <>I have read and accept that details are handled per the{" "}
                  <PrivacyLink className="underline underline-offset-2 text-[var(--ink)] hover:text-[var(--accent-2)]">
                    {COPY.checkout.privacyLink.en}
                  </PrivacyLink>
                </>
              )}
            </label>
          </div>

          {submitError && (
            <p className="text-sm text-[var(--destructive)] text-center leading-snug" role="alert">
              {COPY.checkout.submitFail[lang]}
            </p>
          )}

          <button type="button" onClick={confirm} disabled={!privacyAccepted || isSubmitting}
            className="w-full py-4 bg-[var(--accent)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--ink)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? (<><Spinner size={14} /> {COPY.checkout.processing[lang]}</>) : `${COPY.checkout.confirm[lang]} →`}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ThankyouStep({ formData, orderSnapshot, finalPrice }: {
  formData: CheckoutData; orderSnapshot: CartItem[]; finalPrice: number;
}) {
  const { lang } = useStore();
  const colorCounts: Record<JarColor, number> = { white: 0, green: 0, red: 0 };
  const colorScents: Record<JarColor, Record<string, number>> = { white: {}, green: {}, red: {} };
  for (const item of orderSnapshot) {
    for (const [scentId, qty] of Object.entries(item.quantities)) {
      colorCounts[item.jarColor] += qty;
      colorScents[item.jarColor][scentId] = (colorScents[item.jarColor][scentId] ?? 0) + qty;
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-6">
          <SuccessCheck size={30} />
        </div>
        <h1 className="heading-display text-4xl md:text-5xl text-[var(--ink)] mb-3">
          {COPY.checkout.thanksTitle[lang]}{" "}<em>{formData.firstName}</em>!
        </h1>
        <p className="text-[var(--ink-soft)] leading-relaxed">{COPY.checkout.thanksBody[lang]}</p>
        {formData.paymentMethod && formData.paymentMethod !== "cash" && (
          <p className="mt-3 font-serif italic text-[var(--ink)]">{COPY.checkout.payNow[lang]}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
          <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-4">{COPY.checkout.contents[lang]}</p>
          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            return (
              <div key={color} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                  <p className="font-serif italic text-sm text-[var(--ink)]">
                    {JAR_LABELS[color][lang]}, {colorCounts[color]} {COPY.cart.pcs[lang]}
                  </p>
                </div>
                {SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0).map((s) => (
                  <p key={s.id} className="tag-mono text-[8px] text-[var(--ink-mute)] ml-5 leading-relaxed">
                    {lang === "fi" ? s.name : s.nameEn} ×{colorScents[color][s.id]}
                  </p>
                ))}
              </div>
            );
          })}
          <div className="border-t border-[var(--line)] pt-4 mt-4 flex justify-between items-baseline">
            <span className="tag-mono text-[9px] text-[var(--ink-mute)]">{COPY.cart.total[lang]}</span>
            <span className="font-serif text-2xl italic text-[var(--ink)]">{finalPrice}€</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-4">{COPY.checkout.payment[lang]}</p>
            <PaymentDetails lang={lang} method={formData.paymentMethod} />
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5 space-y-2">
            <p className="text-sm text-[var(--ink-soft)]">
              {formData.delivery === "post"
                ? (lang === "fi" ? "Postitus 5–7 arkipäivässä." : "Posted in 5–7 working days.")
                : COPY.checkout.pickupHint[lang]}
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              <a href={`mailto:${CONTACTS.email}`} className="text-[var(--accent)] hover:text-[var(--ink)]">
                {CONTACTS.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProcessVideo() {
  const { lang } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { void v.play(); setPlaying(true); }
  };

  return (
    <div className="border-t border-[var(--line)] py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div
          className="relative rounded-2xl overflow-hidden border border-[var(--line)] shadow-e4 mx-auto md:mx-0"
          style={{ aspectRatio: "9 / 16", maxWidth: 340 }}
        >
          <video
            ref={videoRef}
            src="/images/Valmistus.mp4"
            playsInline
            preload="metadata"
            controls={playing}
            className="absolute inset-0 w-full h-full object-cover"
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          />
          {!playing && (
            <button
              type="button"
              onClick={toggle}
              className="absolute inset-0 flex items-center justify-center bg-black/25"
              aria-label={lang === "fi" ? "Toista video" : "Play video"}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-md">
                <svg width="18" height="18" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                  <path d="M1 1.2v11.6L11 7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-7">
          <h2 className="font-serif text-4xl md:text-5xl italic leading-[1.1] text-[var(--ink)]">
            {lang === "fi" ? <>Käsityötä,<br /><em>hetki kerrallaan.</em></> : <>Craft,<br /><em>one moment at a time.</em></>}
          </h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            {lang === "fi"
              ? "Jokainen LEIMU syntyy käsin, yksi purkki kerrallaan. Vaha, tuoksu ja sydän saavat rauhassa asettua."
              : "Every LEIMU is made by hand, one jar at a time. Wax, scent and wick are given time to settle."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TuotteetClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    cart, clearCart, lang, openModal, setQuantity, totalQty,
    checkoutStep, setCheckoutStep, lastOrder, setLastOrder, hydrated,
  } = useStore();
  const [formData, setFormData] = useState<CheckoutData>(emptyForm);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState(false);
  const [pricedPreview, setPricedPreview] = useState<{ total: number; basePrice: number; discountAmount: number; deliveryFee: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [hoveredWaxColor, setHoveredWaxColor] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if ((checkoutStep === "checkout" || checkoutStep === "summary") && cart.length === 0) {
      setCheckoutStep("configure");
    }
  }, [hydrated, checkoutStep, cart.length, setCheckoutStep]);

  useEffect(() => {
    if (!hydrated) return;
    const id = searchParams.get("scent");
    if (!id) return;
    const scent = scentById(id);
    if (!scent) return;
    if (totalQty() === 0) setQuantity(id, 1);
    openModal(scent);
    const t = window.setTimeout(() => {
      document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 280);
    router.replace("/tuotteet", { scroll: false });
    return () => window.clearTimeout(t);
  }, [hydrated, searchParams, openModal, setQuantity, totalQty, router]);

  const handleConfirm = async () => {
    if (isSubmitting || !formData.paymentMethod) return;
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      const result = await submitForm({
        formType: "leimu-order",
        tilaaja: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        address: formData.address,
        zip: formData.zip,
        city: formData.city,
        delivery: formData.delivery,
        items: flattenCart(cart),
        personalMessage: formData.wantsPersonalMessage ? formData.personalMessage : "",
        paymentMethod: formData.paymentMethod,
        code: discountApplied ? discountCode : undefined,
        website: "",
      });
      const total = result.total ?? pricedPreview?.total ?? 0;
      setLastOrder({ formData, items: [...cart], total });
      clearCart();
      setCheckoutStep("thankyou");
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    setCheckoutStep("configure");
    setFormData(emptyForm());
    setDiscountCode("");
    setDiscountApplied(false);
    setDiscountError(false);
    setLastOrder(null);
  };

  const step = checkoutStep;
  const thankyouData = lastOrder;

  return (
    <div className="calm-headings pb-24 md:pb-0">
      <FluidBackground waxColor={hoveredWaxColor} />
      <ScentModal />
      <ProductsHero />

      <div className="relative z-10 bg-[var(--bg)] shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-px inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(26,24,20,0.12) 25%, rgba(196,122,58,0.28) 50%, rgba(26,24,20,0.12) 75%, transparent)" }}
        />

        <div className="px-6 md:px-10"><div className="divider" /></div>

        <div className="px-6 md:px-10 max-w-7xl mx-auto pt-16 pb-24">
          <AnimatePresence mode="wait">
            {step === "configure" && (
              <motion.div key="configure" exit={{ opacity: 0, x: -32 }}>
                <ConfigureStep
                  onProceed={() => setCheckoutStep("checkout")}
                  onScentHover={setHoveredWaxColor}
                  onScentLeave={() => setHoveredWaxColor(null)}
                />
              </motion.div>
            )}
            {step === "checkout" && (
              <motion.div key="checkout">
                <CheckoutStep formData={formData} setFormData={setFormData}
                  onBack={() => setCheckoutStep("configure")} onNext={() => setCheckoutStep("summary")} />
              </motion.div>
            )}
            {step === "summary" && (
              <motion.div key="summary">
                <SummaryStep
                  cart={cart} formData={formData} setFormData={setFormData}
                  discountCode={discountCode} setDiscountCode={setDiscountCode}
                  discountApplied={discountApplied} setDiscountApplied={setDiscountApplied}
                  discountError={discountError} setDiscountError={setDiscountError}
                  pricedPreview={pricedPreview} setPricedPreview={setPricedPreview}
                  onBack={() => setCheckoutStep("checkout")}
                  onConfirm={handleConfirm}
                  isSubmitting={isSubmitting} submitError={submitError}
                />
              </motion.div>
            )}
            {step === "thankyou" && thankyouData && (
              <motion.div key="thankyou">
                <ThankyouStep formData={thankyouData.formData} orderSnapshot={thankyouData.items} finalPrice={thankyouData.total} />
                <div className="mt-12 text-center">
                  <button type="button" onClick={resetOrder}
                    className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] underline underline-offset-4 transition-colors">
                    {COPY.checkout.newOrder[lang]}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === "configure" && (
          <>
            <ProcessVideo />
            <div className="border-t border-[var(--line)]">
              <GiftCeremony ctaHref="#configurator" />
            </div>
          </>
        )}
      </div>
      <StickyCartBar onProceed={() => setCheckoutStep("checkout")} />
    </div>
  );
}
