"use client";

import { useState, useId, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useStore } from "@/context/store";
import { SCENTS, PRICE_TABLE, calcPrice, formatEuro, FEATURED_SCENT_ID } from "@/lib/scents";
import { ScentCard } from "@/components/ScentCard";
import { submitForm } from "@/lib/formSubmit";
import { CandleSVG } from "@/components/CandleSVG";
import { ScentModal } from "@/components/ScentModal";
import { PrivacyLink } from "@/components/PrivacyModal";
import type { Scent, JarColor, CartItem, CheckoutData } from "@/types";
import { usePinned } from "@/lib/pin";
import { landOn, scrollToTarget, syncLenis } from "@/lib/scroll";
import { coverVars } from "@/lib/timeline";
import { StillLifeChapter, COVER_SVH as STILL_COVER_SVH } from "@/components/tuotteet/StillLifeChapter";
import { CraftChapter } from "@/components/tuotteet/CraftChapter";
import { GiftChapter } from "@/components/tuotteet/GiftChapter";
import { ChapterRail, type Chapter } from "@/components/story/ChapterRail";
import { useStaggeredReveal } from "@/components/story/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { SuccessCheck } from "@/components/ui/SuccessCheck";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer, VIEWPORT_NEAR } from "@/lib/motionVariants";

/* ─── Constants ────────────────────────────────── */
const JAR_LABELS: Record<JarColor, { fi: string; en: string }> = {
  white: { fi: "Valkoinen", en: "White" },
  green: { fi: "Vihreä", en: "Green" },
  red:   { fi: "Punainen", en: "Red" },
};

const JAR_ADJ: Record<JarColor, string> = {
  white: "Valkoisia",
  green: "Vihreitä",
  red:   "Punaisia",
};

const JAR_DOT: Record<JarColor, string> = {
  white: "bg-stone-300",
  green: "bg-[#5C7A48]",
  red:   "bg-[#8B2E2E]",
};

/* ─── Helpers ──────────────────────────────────── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5 border-b border-[var(--line)] last:border-0">
      <span className="tag-mono flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--ink)] text-right">{value}</span>
    </div>
  );
}

function InputField({ label, type = "text", required = false, autoComplete, value, onChange, error }: {
  label: string; type?: string; required?: boolean; autoComplete?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="tag-mono block mb-2">{label}</label>
      <input
        id={id} type={type} required={required} autoComplete={autoComplete} value={value} onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full px-4 py-3 rounded-md border bg-[var(--bg)] text-[var(--ink)] text-sm transition-colors duration-base focus:outline-none",
          error
            ? "border-[var(--destructive)] focus:border-[var(--destructive)]"
            : "border-[var(--field-border)] focus:border-[var(--accent-2)]",
        ].join(" ")}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="font-mono text-[12px] tracking-[0.08em] text-[var(--destructive)] mt-1.5 leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}

function ProgressBar({ step }: { step: string }) {
  const lang = useStore((s) => s.lang);
  const steps = ["configure", "checkout", "summary"];
  const labels = lang === "fi"
    ? ["Ostoskori", "Yhteystiedot", "Yhteenveto"]
    : ["Cart", "Contact details", "Summary"];
  const current = step === "thankyou" ? 2 : steps.indexOf(step);
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= current ? "text-[var(--ink)]" : "text-[var(--ink-mute)]"}`}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] transition-colors ${i <= current ? "bg-[var(--ink)] text-[var(--bg)]" : "border border-[var(--line)] text-[var(--ink-mute)]"}`}>
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6.4l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i + 1}
            </div>
            <span className="tag-mono hidden md:inline" style={i <= current ? { color: "var(--ink)" } : undefined}>{labels[i]}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-3 h-px w-10 transition-colors ${i < current ? "bg-[var(--accent-2)]" : "bg-[var(--line)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const GRID_HEADING_ID = "tuotteet-scents-heading";

/* Where the still life pins (md+, motion allowed), each specimen wipes up
   through its mount with the scroll, in reading order, as on home.
   Elsewhere the cards simply fade up. */
function ProductGrid() {
  const lang = useStore((s) => s.lang);
  const openModal = useStore((s) => s.openModal);
  const scrubbed = usePinned();
  const gridRef = useRef<HTMLDivElement>(null);
  const { p, near, at } = useStaggeredReveal(gridRef, SCENTS.length);

  const featured = SCENTS.find((s) => s.id === FEATURED_SCENT_ID) ?? SCENTS[0];
  const specimens = [featured, ...SCENTS.filter((s) => s.id !== featured.id)];

  return (
    <section id="tuoksut" className="mb-16" aria-labelledby={GRID_HEADING_ID}>
      <h2 id={GRID_HEADING_ID} className="heading-display mb-10 text-4xl text-[var(--ink)] md:text-5xl">
        {lang === "fi" ? <><span>Tutustu </span><em>tuoksuihin</em></> : <><span>Explore the </span><em>scents</em></>}
      </h2>
      <motion.div
        ref={gridRef}
        className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {specimens.map((scent, i) => (
          <ScentCard
            key={scent.id}
            scent={scent}
            lang={lang}
            featured={scent.id === featured.id}
            onSelect={openModal}
            reveal={scrubbed ? { p, at: at(i) } : undefined}
            eager={near}
          />
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Quantity Stepper ──────────────────────────── */
function QuantityStepper({ scent }: { scent: Scent }) {
  const lang = useStore((s) => s.lang);
  const qty = useStore((s) => s.config.quantities[scent.id] ?? 0);
  const total = useStore((s) => s.totalQty());
  const setQuantity = useStore((s) => s.setQuantity);
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--line)] last:border-0">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--line)]">
        <Image src={scent.image} alt={lang === "fi" ? scent.name : scent.nameEn} fill className="object-cover" sizes="56px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif italic text-base text-[var(--ink)] leading-tight truncate">{lang === "fi" ? scent.name : scent.nameEn}</p>
        <p className="text-[12px] text-[var(--ink-mute)] mt-0.5 truncate">{lang === "fi" ? scent.profile : scent.profileEn}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setQuantity(scent.id, qty - 1)} disabled={qty === 0}
          className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center hover:bg-[var(--bg-2)] active:scale-95 transition-[background-color,opacity,transform] disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none"><path d="M1 1h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="w-7 text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={qty} className="block font-serif text-xl italic text-[var(--ink)]"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}>{qty}</motion.span>
          </AnimatePresence>
        </div>
        <button onClick={() => setQuantity(scent.id, qty + 1)} disabled={total >= 6}
          className="w-11 h-11 rounded-full border border-[var(--ink)] bg-[var(--ink)] flex items-center justify-center text-[var(--bg)] hover:bg-[var(--accent-2-strong)] hover:border-[var(--accent-2-strong)] active:scale-95 transition-[background-color,border-color,opacity,transform] disabled:opacity-40 disabled:cursor-not-allowed">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Cart Item Card ────────────────────────────── */
function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  const lang = useStore((s) => s.lang);
  const totalInItem = Object.values(item.quantities).reduce((s, q) => s + q, 0);
  const scentLine = SCENTS.filter((s) => (item.quantities[s.id] ?? 0) > 0)
    .map((s) => `${lang === "fi" ? s.name : s.nameEn} ×${item.quantities[s.id]}`)
    .join(", ");
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[var(--line)] last:border-0">
      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${JAR_DOT[item.jarColor]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-serif italic text-sm text-[var(--ink)]">
          {JAR_LABELS[item.jarColor][lang]} · {totalInItem} {lang === "fi" ? "kpl" : "pcs"}
        </p>
        <p className="text-[12px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">{scentLine}</p>
      </div>
      {/* 44px hit area; the negative margins keep the row layout as it was. */}
      <button onClick={onRemove}
        aria-label={`${lang === "fi" ? "Poista" : "Remove"}: ${JAR_LABELS[item.jarColor][lang]}, ${totalInItem} ${lang === "fi" ? "kpl" : "pcs"}`}
        className="-mx-[13px] -my-[11px] flex size-11 flex-shrink-0 items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Step 1: Configure ─────────────────────────── */
function ConfigureStep({ onProceed }: { onProceed: () => void }) {
  const lang = useStore((s) => s.lang);
  const config = useStore((s) => s.config);
  const cart = useStore((s) => s.cart);
  const currentQty = useStore((s) => s.totalQty());
  const cartQty = useStore((s) => s.cartTotalQty());
  const cartPrice = useStore((s) => s.cartTotalPrice());
  const setJar = useStore((s) => s.setJar);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const jars: JarColor[] = ["white", "green", "red"];

  const handleAddToCart = () => {
    if (currentQty === 0) return;
    addToCart(config.jar, { ...config.quantities });
  };

  return (
    <div>
      <ProductGrid />

      <div className="divider mb-16" />

      <div id="configurator">
        <ProgressBar step="configure" />

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Configurator */}
          <div>
            <p className="tag-mono mb-2">{lang === "fi" ? "Lisää koriin" : "Add to cart"}</p>
            <h2 className="heading-display text-3xl md:text-4xl mb-8 text-[var(--ink)]">
              {lang === "fi" ? <><span>Kokoa oma </span><em>tilauksesi</em></> : <><span>Build your </span><em>order</em></>}
            </h2>

            {/* Jar selector */}
            <div className="mb-8">
              <p className="tag-mono mb-1">
                {lang === "fi" ? "Valitse purkin väri" : "Choose jar colour"}
              </p>
              <p className="text-[12px] leading-snug text-[var(--ink-soft)] mb-3">
                {lang === "fi"
                  ? "Kaikki purkit ovat läpikuultavaa maitolasia (mattalasi)."
                  : "All jars are translucent frosted milk glass."}
              </p>
              <div className="flex gap-3">
                {jars.map((jar) => (
                  <button key={jar} onClick={() => setJar(jar)} aria-pressed={config.jar === jar}
                    className={["flex flex-col items-center gap-2 p-3 rounded-xl border transition-[background-color,border-color] duration-200",
                      config.jar === jar ? "border-[var(--accent-2)] bg-[var(--accent-2-tint)]" : "border-[var(--line)] hover:border-[var(--accent-3)]"].join(" ")}>
                    <div className="w-14 aspect-[3/5]"><CandleSVG jar={jar} animate={false} /></div>
                    <span className="tag-mono !text-[var(--ink-soft)]">{JAR_LABELS[jar][lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scent steppers */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="tag-mono">
                  {lang === "fi" ? "Valitse tuoksut" : "Choose scents"}
                </p>
                <span className={`tag-mono ${currentQty >= 6 ? "text-[var(--accent-2-strong)]" : "text-[var(--ink-mute)]"}`}>
                  {currentQty}/6
                </span>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4">
                {SCENTS.map((scent) => <QuantityStepper key={scent.id} scent={scent} />)}
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={currentQty === 0}
              className="w-full py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] tracking-[0.15em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
              {lang === "fi" ? "+ Lisää koriin" : "+ Add to cart"}
            </button>
          </div>

          {/* Right: Cart */}
          <div className="md:sticky md:top-24">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
                <p className="tag-mono !text-[var(--ink)]">{lang === "fi" ? "Ostoskori" : "Cart"}</p>
                <p className="tag-mono">
                  {cartQty} {lang === "fi" ? "kynttilää" : "candles"}
                </p>
              </div>

              <div className="px-6 min-h-[100px]">
                {cart.length === 0 ? (
                  <EmptyState message={lang === "fi" ? "Kori on tyhjä" : "Cart is empty"} />
                ) : (
                  cart.map((item) => (
                    <CartItemCard key={item.id} item={item} onRemove={() => removeFromCart(item.id)} />
                  ))
                )}
              </div>

              <div className="px-6 py-4 border-t border-[var(--line)] space-y-4">
                {cartQty > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>{Object.keys(PRICE_TABLE).map((n) => (
                          <th key={n} className="tag-mono text-[var(--ink-mute)] font-normal pb-1 pr-3 text-left">{n} {lang === "fi" ? "kpl" : "pcs"}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        <tr>{Object.values(PRICE_TABLE).map((p, i) => (
                          <td key={i} className={`font-serif italic text-sm pr-3 ${i + 1 === cartQty ? "text-[var(--accent-2-text)]" : "text-[var(--ink-mute)]"}`}>{formatEuro(p)}</td>
                        ))}</tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="tag-mono">{lang === "fi" ? "Yhteensä" : "Total"}</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={cartPrice} className="font-serif text-3xl italic text-[var(--ink)]"
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                        {cartQty > 0 ? formatEuro(cartPrice) : formatEuro(0)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <button onClick={onProceed} disabled={cart.length === 0}
                  className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  {lang === "fi" ? "Jatka tilaukseen →" : "Proceed to checkout →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Checkout Form ─────────────────────── */
function CheckoutStep({ formData, setFormData, onBack, onNext }: {
  formData: CheckoutData; setFormData: (d: CheckoutData) => void;
  onBack: () => void; onNext: () => void;
}) {
  const lang = useStore((s) => s.lang);
  const [emailError, setEmailError] = useState("");
  const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
  const field = (key: keyof CheckoutData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData({ ...formData, [key]: e.target.value }),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(formData.email.trim())) {
      setEmailError(lang === "fi" ? "Tarkista sähköpostiosoite." : "Check your email address.");
      return;
    }
    setEmailError("");
    onNext();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="max-w-lg mx-auto">
      <ProgressBar step="checkout" />
      <button onClick={onBack} className="tag-mono text-[var(--ink-mute)] hover:text-[var(--ink)] flex min-h-11 items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {lang === "fi" ? "Takaisin" : "Back"}
      </button>
      <p className="tag-mono mb-2">{lang === "fi" ? "Yhteystiedot" : "Contact details"}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">
        {lang === "fi" ? <><span>Toimitus ja </span><em>tiedot</em></> : <><span>Delivery and </span><em>details</em></>}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label={lang === "fi" ? "Etunimi" : "First name"} required autoComplete="given-name" {...field("firstName")} />
          <InputField label={lang === "fi" ? "Sukunimi" : "Last name"} required autoComplete="family-name" {...field("lastName")} />
        </div>
        <InputField
          label={lang === "fi" ? "Sähköposti" : "Email"} type="email" required autoComplete="email"
          value={formData.email}
          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (emailError) setEmailError(""); }}
          error={emailError}
        />
        <InputField label={lang === "fi" ? "Osoite" : "Address"} required autoComplete="street-address" {...field("address")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label={lang === "fi" ? "Postinumero" : "Postcode"} required autoComplete="postal-code" {...field("zip")} />
          <InputField label={lang === "fi" ? "Kaupunki" : "City"} required autoComplete="address-level2" {...field("city")} />
        </div>
        <div className="flex items-start gap-3 pt-3 pb-1">
          <input type="checkbox" id="delivery" checked={formData.wantsDelivery}
            onChange={(e) => setFormData({ ...formData, wantsDelivery: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[var(--accent-2-strong)] cursor-pointer flex-shrink-0" />
          <label htmlFor="delivery" className="cursor-pointer">
            <p className="text-sm text-[var(--ink)]">{lang === "fi" ? "Tarvitsen kuljetuksen" : "I need delivery"}</p>
            <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">{lang === "fi" ? "Postitus" : "Postage"} +{formatEuro(8)}</p>
          </label>
        </div>
        <div className="flex items-start gap-3 pb-1">
          <input type="checkbox" id="personalMsg" checked={formData.wantsPersonalMessage}
            onChange={(e) => setFormData({ ...formData, wantsPersonalMessage: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[var(--accent-2-strong)] cursor-pointer flex-shrink-0" />
          <label htmlFor="personalMsg" className="cursor-pointer">
            <p className="text-sm text-[var(--ink)]">
              {lang === "fi" ? "Haluan itsekirjoitetun viestin sinetöityyn kuoreen" : "Add my own message in a sealed envelope"}
            </p>
            <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">
              {lang === "fi" ? "Käsinkirjoitettu viesti lisätään tilaukseen" : "We write your message by hand and add it to your order"}
            </p>
          </label>
        </div>
        {formData.wantsPersonalMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <label htmlFor="personal-message" className="tag-mono block mb-1.5">
              {lang === "fi" ? "Kirjoita viestisi" : "Write your message"}
            </label>
            <textarea
              id="personal-message" aria-describedby="personal-message-hint"
              value={formData.personalMessage}
              onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors duration-base resize-none leading-relaxed"
            />
            <p id="personal-message-hint" className="text-[12px] text-[var(--ink-mute)] mt-1.5 leading-snug">
              {lang === "fi"
                ? "Erottele viestit numeroilla, esim: 1. Hyvää syntymäpäivää! 2. Rakastan sinua..."
                : "Number each message, e.g. 1. Happy birthday! 2. I love you..."}
            </p>
          </motion.div>
        )}
        <div className="pt-4 border-t border-[var(--line)]">
          <button type="submit"
            className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200">
            {lang === "fi" ? "Seuraava →" : "Next →"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* ─── Step 3: Summary ───────────────────────────── */
function SummaryStep({
  cart, formData, discountCode, setDiscountCode, discountApplied,
  setDiscountApplied, discountError, setDiscountError, onBack, onConfirm,
  isSubmitting, submitError,
}: {
  cart: CartItem[];
  formData: CheckoutData;
  discountCode: string;
  setDiscountCode: (v: string) => void;
  discountApplied: boolean;
  setDiscountApplied: (v: boolean) => void;
  discountError: boolean;
  setDiscountError: (v: boolean) => void;
  onBack: () => void;
  onConfirm: (finalPrice: number) => void;
  isSubmitting: boolean;
  submitError: boolean;
}) {
  const lang = useStore((s) => s.lang);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const colorCounts: Record<JarColor, number> = { white: 0, green: 0, red: 0 };
  const colorScents: Record<JarColor, Record<string, number>> = { white: {}, green: {}, red: {} };
  for (const item of cart) {
    for (const [scentId, qty] of Object.entries(item.quantities)) {
      colorCounts[item.jarColor] += qty;
      colorScents[item.jarColor][scentId] = (colorScents[item.jarColor][scentId] ?? 0) + qty;
    }
  }

  const totalCandles = cart.reduce((s, item) => s + Object.values(item.quantities).reduce((a, q) => a + q, 0), 0);
  const basePrice = calcPrice(totalCandles);
  const discountAmount = discountApplied ? Math.floor(basePrice * 0.15) : 0;
  const deliveryFee = formData.wantsDelivery ? 8 : 0;
  const finalPrice = basePrice - discountAmount + deliveryFee;

  const handleApply = () => {
    if (discountCode.trim().toUpperCase() === "LEIMU29") {
      setDiscountApplied(true); setDiscountError(false);
    } else {
      setDiscountError(true); setDiscountApplied(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="max-w-4xl mx-auto">
      <ProgressBar step="summary" />
      <button onClick={onBack} className="tag-mono text-[var(--ink-mute)] hover:text-[var(--ink)] flex min-h-11 items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {lang === "fi" ? "Takaisin" : "Back"}
      </button>
      <p className="tag-mono mb-2">{lang === "fi" ? "Tarkista tilauksesi ennen vahvistusta" : "Review before confirming"}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">{lang === "fi" ? "Yhteenveto" : "Summary"}</h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Order details */}
        <div className="space-y-8">
          <div>
            <p className="tag-mono mb-3">{lang === "fi" ? "Purkkivalinnat" : "Jars"}</p>
            {(["white", "green", "red"] as JarColor[]).map((color) =>
              colorCounts[color] > 0 ? (
                <div key={color} className="flex justify-between items-center py-2.5 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                    <span className="text-sm text-[var(--ink)]">
                      {lang === "fi" ? `${JAR_ADJ[color]} purkkeja` : `${JAR_LABELS[color].en} jars`}
                    </span>
                  </div>
                  <span className="font-serif italic text-xl text-[var(--ink)]">{colorCounts[color]} {lang === "fi" ? "kpl" : "pcs"}</span>
                </div>
              ) : null
            )}
          </div>

          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            const scentItems = SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0);
            return (
              <div key={color}>
                <p className="tag-mono mb-3">
                  {lang === "fi" ? "Tuoksut" : "Scents"} ({JAR_LABELS[color][lang]})
                </p>
                {scentItems.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[var(--line)] last:border-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={s.image} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                    <span className="font-serif italic text-sm text-[var(--ink)] flex-1">{lang === "fi" ? s.name : s.nameEn}</span>
                    <span className="tag-mono">×{colorScents[color][s.id]}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: Pricing + actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6 space-y-3">
            <Row label={lang === "fi" ? "Kynttilät" : "Candles"} value={formatEuro(basePrice)} />
            {discountApplied && <Row label={lang === "fi" ? "Alennus (15%)" : "Discount (15%)"} value={`−${formatEuro(discountAmount)}`} />}
            {formData.wantsDelivery && <Row label={lang === "fi" ? "Toimitus" : "Delivery"} value={`+${formatEuro(8)}`} />}
            <div className="border-t border-[var(--line)] pt-3 flex justify-between items-baseline">
              <span className="tag-mono">{lang === "fi" ? "Hinta yhteensä" : "Total"}</span>
              <AnimatePresence mode="wait">
                <motion.span key={finalPrice} className="font-serif text-3xl italic text-[var(--ink)]"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                  {formatEuro(finalPrice)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div>
            <p id="discount-code-label" className="tag-mono mb-2">{lang === "fi" ? "Alekoodi" : "Discount code"}</p>
            {discountApplied ? (
              <motion.p className="text-sm text-[var(--accent)] font-serif italic"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {lang === "fi" ? "Alennus 15% lisätty" : "15% discount applied"}
              </motion.p>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={discountCode}
                  aria-labelledby="discount-code-label" aria-invalid={discountError || undefined}
                  onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(false); }}
                  className={["flex-1 px-4 py-2.5 rounded-md border bg-[var(--bg)] text-[var(--ink)] text-sm font-mono focus:outline-none transition-colors duration-base",
                    discountError ? "border-[var(--destructive)] focus:border-[var(--destructive)]" : "border-[var(--field-border)] focus:border-[var(--accent-2)]"].join(" ")} />
                <button onClick={handleApply}
                  className="min-h-11 px-4 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] tracking-[0.1em] uppercase rounded-xl hover:bg-[var(--accent-2-strong)] transition-colors">
                  OK
                </button>
              </div>
            )}
            {discountError && (
              <p role="alert" className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--destructive)] mt-1.5">
                {lang === "fi" ? "Virheellinen koodi" : "Invalid code"}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5">
            <p className="tag-mono mb-3">{lang === "fi" ? "Yhteystiedot" : "Contact details"}</p>
            <Row label={lang === "fi" ? "Nimi" : "Name"} value={`${formData.firstName} ${formData.lastName}`} />
            <Row label={lang === "fi" ? "Sähköposti" : "Email"} value={formData.email} />
            <Row label={lang === "fi" ? "Osoite" : "Address"} value={formData.address} />
            <Row label={lang === "fi" ? "Postinumero ja kaupunki" : "Postcode and city"} value={`${formData.zip} ${formData.city}`} />
            <Row
              label={lang === "fi" ? "Postitus" : "Delivery by post"}
              value={formData.wantsDelivery ? (lang === "fi" ? "Kyllä" : "Yes") : (lang === "fi" ? "Ei" : "No")}
            />
            {formData.wantsPersonalMessage && formData.personalMessage && (
              <div className="py-1.5 border-b border-[var(--line)]">
                <span className="tag-mono block mb-1">{lang === "fi" ? "Henkilökohtainen viesti" : "Personal message"}</span>
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">{formData.personalMessage}</p>
              </div>
            )}
            <Row label={lang === "fi" ? "Hinta" : "Price"} value={formatEuro(finalPrice)} />
          </div>

          <div className="flex items-start gap-3 py-1">
            <input type="checkbox" id="privacyConsent" checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--accent-2-strong)] cursor-pointer flex-shrink-0" />
            <label htmlFor="privacyConsent" className="cursor-pointer text-sm text-[var(--ink-soft)] leading-snug">
              {lang === "fi" ? (
                <>
                  Olen lukenut ja hyväksyn, että tiedot käsitellään{" "}
                  <PrivacyLink className="underline underline-offset-2 text-[var(--ink)] hover:text-[var(--accent-2)] transition-colors">
                    tietosuojaselosteen
                  </PrivacyLink>{" "}
                  mukaisesti
                </>
              ) : (
                <>
                  I have read the{" "}
                  <PrivacyLink className="underline underline-offset-2 text-[var(--ink)] hover:text-[var(--accent-2)] transition-colors">
                    privacy policy
                  </PrivacyLink>{" "}
                  and accept how my details are handled
                </>
              )}
            </label>
          </div>

          {submitError && (
            <p className="text-sm text-[var(--destructive)] text-center leading-snug" role="alert">
              {lang === "fi"
                ? "Tilauksen lähetys epäonnistui, tarkista yhteys ja yritä uudelleen."
                : "We couldn't send your order. Check your connection and try again."}
            </p>
          )}

          <button onClick={() => onConfirm(finalPrice)} disabled={!privacyAccepted || isSubmitting}
            className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting
              ? (<><Spinner size={14} /> {lang === "fi" ? "Käsitellään…" : "Processing…"}</>)
              : lang === "fi" ? "Vahvista tilaus →" : "Confirm order →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Step 4: Thank You ─────────────────────────── */
function ThankyouStep({ formData, orderSnapshot, finalPrice }: {
  formData: CheckoutData; orderSnapshot: CartItem[]; finalPrice: number;
}) {
  const lang = useStore((s) => s.lang);
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
        <div className="w-16 h-16 rounded-full bg-[rgba(46,61,42,0.1)] flex items-center justify-center mx-auto mb-6">
          <SuccessCheck size={30} />
        </div>
        <h1 className="heading-display text-4xl md:text-5xl text-[var(--ink)] mb-3">
          {lang === "fi"
            ? <>Kiitos tilauksestasi,{" "}<em>{formData.firstName}</em>!</>
            : <>Thank you for your order,{" "}<em>{formData.firstName}</em>!</>}
        </h1>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          {lang === "fi"
            ? "Olemme vastaanottaneet tilauksesi ja lähetämme vahvistuksen osoitteeseen:"
            : "We have received your order and will send a confirmation to:"}{" "}
          <span className="font-mono text-sm text-[var(--ink)]">{formData.email}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
          <p className="tag-mono mb-4">{lang === "fi" ? "Tilauksesi sisältö" : "Your order"}</p>
          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            return (
              <div key={color} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                  <p className="font-serif italic text-sm text-[var(--ink)]">
                    {JAR_LABELS[color][lang]}, {colorCounts[color]} {lang === "fi" ? "kpl" : "pcs"}
                  </p>
                </div>
                {SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0).map((s) => (
                  <p key={s.id} className="tag-mono ml-5 leading-relaxed">
                    {lang === "fi" ? s.name : s.nameEn} ×{colorScents[color][s.id]}
                  </p>
                ))}
              </div>
            );
          })}
          <div className="border-t border-[var(--line)] pt-4 mt-4 flex justify-between items-baseline">
            <span className="tag-mono">
              {lang === "fi"
                ? (formData.wantsDelivery ? "Hinta (sis. toimitus)" : "Hinta yhteensä")
                : (formData.wantsDelivery ? "Total (incl. delivery)" : "Total")}
            </span>
            <span className="font-serif text-2xl italic text-[var(--ink)]">{formatEuro(finalPrice)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
            <p className="tag-mono mb-4">{lang === "fi" ? "Maksutavat" : "Payment methods"}</p>
            <div className="text-sm">
              <div className="flex justify-between items-baseline gap-4 py-2 border-b border-[var(--line)]">
                <span className="text-[var(--ink)]">{lang === "fi" ? "Käteinen" : "Cash"}</span>
                <span className="text-[var(--ink-mute)] text-[13px]">{lang === "fi" ? "toimituksen yhteydessä" : "on delivery"}</span>
              </div>
              <div className="flex justify-between items-baseline gap-4 py-2 border-b border-[var(--line)]">
                <span className="text-[var(--ink)]">MobilePay</span>
                <span className="font-mono text-[13px] text-[var(--ink)]">+358 50 5418295</span>
              </div>
              <div className="flex justify-between items-baseline gap-4 py-2">
                <span className="text-[var(--ink)]">Siirto</span>
                <span className="font-mono text-[13px] text-[var(--ink)]">+358 50 5418295</span>
              </div>
            </div>
            <p className="mt-4 pt-3 border-t border-[var(--line)] text-[13px] leading-relaxed text-[var(--ink-soft)]">
              {lang === "fi"
                ? "Mainitse maksussa oma nimesi, jotta voimme yhdistää sen tilaukseesi."
                : "Add your name to the payment so we can match it to your order."}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5 space-y-2">
            <p className="text-sm text-[var(--ink-soft)]">
              <strong className="text-[var(--ink)]">{lang === "fi" ? "Toimitusaika:" : "Delivery time:"}</strong>{" "}
              {lang === "fi"
                ? "Toimitus Oulun alueella henkilökohtaisesti tai postitse 5–7 arkipäivän kuluessa."
                : "Delivered in person in the Oulu area, or by post, within 5–7 working days."}
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              <strong className="text-[var(--ink)]">{lang === "fi" ? "Kysyttävää?" : "Questions?"}</strong>{" "}
              <a href="mailto:leimucandles@gmail.com"
                className="text-[var(--accent-2-strong)] underline underline-offset-2 hover:text-[var(--ink)] transition-colors">
                leimucandles@gmail.com
              </a>
            </p>
          </div>
          <p className="text-center font-serif italic text-[var(--ink-mute)] text-sm px-2">
            {lang === "fi"
              ? "Tuoksuisia hetkiä ja kiitos, kun tuet LEIMU Candlesia."
              : "Fragrant moments to you, and thank you for supporting LEIMU Candles."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────── */
type Step = "configure" | "checkout" | "summary" | "thankyou";

const CHAPTERS: Chapter[] = [
  { id: "asetelma", label: { fi: "Asetelma", en: "Still life" } },
  { id: "tuoksut", label: { fi: "Tuoksut", en: "Scents" } },
  { id: "configurator", label: { fi: "Tilaus", en: "Order" } },
  { id: "kasityo", label: { fi: "Käsityö", en: "Craft" } },
  { id: "lahja", label: { fi: "Lahja", en: "Gift" } },
];

/* On desktop the still life pins, then this opaque, higher-z sheet rises
   over it. Phones and reduced motion keep everything in normal flow.

   The order steps swap in one place. Each new step lands like an anchor
   jump: the page glides to its order panel (#configurator, which every
   step carries) and keyboard focus moves there, since the button that
   was pressed has just left the page. */
export function TuotteetClient() {
  const lang = useStore((s) => s.lang);
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("configure");
  const landing = useRef(false);
  const go = (next: Step) => {
    landing.current = true;
    setStep(next);
  };
  // Runs as the new step mounts, once the old one has left.
  const land = useCallback((el: HTMLElement | null) => {
    if (!el || !landing.current) return;
    landing.current = false;
    const panel = el.querySelector<HTMLElement>("#configurator") ?? el;
    // The swap changed the page height, which may have moved the native
    // scroll under Lenis.
    syncLenis();
    scrollToTarget(panel);
    landOn(panel, { hash: false });
  }, []);
  const [formData, setFormData] = useState<CheckoutData>({
    firstName: "", lastName: "", email: "",
    address: "", zip: "", city: "",
    wantsDelivery: false, wantsPersonalMessage: false, personalMessage: "",
  });
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState(false);
  const [confirmedPrice, setConfirmedPrice] = useState(0);
  const [orderSnapshot, setOrderSnapshot] = useState(cart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleConfirm = async (price: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(false);

    // Per-scent and per-jar-colour breakdown across the whole cart
    const scentQty: Record<string, number> = {};
    const jarQty: Record<JarColor, number> = { white: 0, green: 0, red: 0 };
    let totalCandles = 0;
    for (const item of cart) {
      for (const s of SCENTS) {
        const q = item.quantities[s.id] ?? 0;
        if (q > 0) {
          scentQty[s.id] = (scentQty[s.id] ?? 0) + q;
          jarQty[item.jarColor] += q;
          totalCandles += q;
        }
      }
    }

    // Human-readable per-jar breakdown (e.g. "Valkoinen: Havu x2 | Vihreä: Mustikka x1")
    const items = cart
      .map((item) => {
        const scents = SCENTS.filter((s) => (item.quantities[s.id] ?? 0) > 0)
          .map((s) => `${s.name} x${item.quantities[s.id]}`)
          .join(", ");
        return `${JAR_LABELS[item.jarColor].fi}: ${scents}`;
      })
      .join(" | ");

    try {
      await submitForm({
        formType: "leimu-order",
        tilaaja: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        address: formData.address,
        zip: formData.zip,
        city: formData.city,
        delivery: formData.wantsDelivery ? "Posti (+8 €)" : "Nouto",
        totalCandles,
        price,
        havu: scentQty["havu"] ?? 0,
        havuVanilja: scentQty["havu-vanilja"] ?? 0,
        vanilja: scentQty["vanilja"] ?? 0,
        mustikka: scentQty["mustikka"] ?? 0,
        mustikkaVanilja: scentQty["mustikka-vanilja"] ?? 0,
        white: jarQty.white,
        green: jarQty.green,
        red: jarQty.red,
        items,
        personalMessage: formData.wantsPersonalMessage ? formData.personalMessage : "",
      });

      // success, run the existing reset/advance logic
      setConfirmedPrice(price);
      setOrderSnapshot([...cart]);
      clearCart();
      go("thankyou");
    } catch (error) {
      console.error("Tilauksen lähetys epäonnistui:", error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    go("configure");
    setFormData({ firstName: "", lastName: "", email: "", address: "", zip: "", city: "", wantsDelivery: false, wantsPersonalMessage: false, personalMessage: "" });
    setDiscountCode("");
    setDiscountApplied(false);
    setDiscountError(false);
  };

  return (
    <div>
      <ScentModal />

      <StillLifeChapter />

      <ChapterRail chapters={CHAPTERS} startRef={sheetRef} />
      {/* The pull-up is StillLifeChapter's COVER_SVH. */}
      <div
        ref={sheetRef}
        data-tone="light"
        className="relative z-10 bg-[var(--bg)] md:motion-safe:-mt-[var(--cover)] md:motion-safe:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)]"
        style={coverVars(STILL_COVER_SVH)}
      >
        {/* Seam and shadow only where the sheet rises over the pinned
            still life; in flow the two simply follow each other. */}
        <div aria-hidden="true" className="sheet-seam hidden md:motion-safe:block" />

      <div className="px-6 md:px-10 max-w-7xl mx-auto pt-16 pb-24">
        <AnimatePresence mode="wait">
          {step === "configure" && (
            <motion.div key="configure" ref={land} exit={{ opacity: 0, x: -32 }}>
              <ConfigureStep onProceed={() => go("checkout")} />
            </motion.div>
          )}
          {step === "checkout" && (
            <motion.div key="checkout" id="configurator" ref={land}>
              <CheckoutStep formData={formData} setFormData={setFormData}
                onBack={() => go("configure")} onNext={() => go("summary")} />
            </motion.div>
          )}
          {step === "summary" && (
            <motion.div key="summary" id="configurator" ref={land}>
              <SummaryStep cart={cart} formData={formData}
                discountCode={discountCode} setDiscountCode={setDiscountCode}
                discountApplied={discountApplied} setDiscountApplied={setDiscountApplied}
                discountError={discountError} setDiscountError={setDiscountError}
                onBack={() => go("checkout")} onConfirm={handleConfirm}
                isSubmitting={isSubmitting} submitError={submitError} />
            </motion.div>
          )}
          {step === "thankyou" && (
            <motion.div key="thankyou" id="configurator" ref={land}>
              <ThankyouStep formData={formData} orderSnapshot={orderSnapshot} finalPrice={confirmedPrice} />
              <div className="mt-12 text-center">
                <button onClick={resetOrder}
                  className="tag-mono inline-flex min-h-11 items-center hover:text-[var(--ink)] underline underline-offset-4 transition-colors">
                  {lang === "fi" ? "Tee uusi tilaus" : "Place a new order"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CraftChapter />

      <GiftChapter />
      </div>
    </div>
  );
}
