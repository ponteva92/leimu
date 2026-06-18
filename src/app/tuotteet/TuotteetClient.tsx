"use client";

import { useState, useRef, useCallback } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform as useTf,
} from "framer-motion";
import Image from "next/image";
import { useStore } from "@/context/store";
import { SCENTS, PRICE_TABLE, calcPrice } from "@/lib/scents";
import { submitForm } from "@/lib/formSubmit";
import { CandleSVG } from "@/components/CandleSVG";
import { ScentModal } from "@/components/ScentModal";
import { PrivacyLink } from "@/components/PrivacyModal";
import type { Scent, JarColor, CartItem, CheckoutData } from "@/types";
import { ProductsHero } from "@/components/tuotteet/ProductsHero";
import {
  headingReveal, fadeUpItem, staggerContainer,
  VIEWPORT_ONCE, VIEWPORT_NEAR,
} from "@/lib/motionVariants";

/* ─── Constants ────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

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




/* ─── Fluid Background ─────────────────────────────────────────────────
   Fixed ambient glow that slowly transitions (3 s) to the hovered
   scent's waxColor.  Positioned behind everything (z-[-1]).
   Uses a radial gradient radiating from top-center so it's subtle
   on the warm page background.
──────────────────────────────────────────────────────────────────────── */
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

/* ─── Helpers ──────────────────────────────────── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5 border-b border-[var(--line)] last:border-0">
      <span className="tag-mono text-[8px] text-[var(--ink-mute)] flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--ink)] text-right">{value}</span>
    </div>
  );
}

function InputField({ label, type = "text", required = false, value, onChange }: {
  label: string; type?: string; required?: boolean;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="tag-mono text-[8px] text-[var(--ink-mute)] block mb-1.5">{label}</label>
      <input type={type} required={required} value={value} onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors" />
    </div>
  );
}

function ProgressBar({ step }: { step: string }) {
  const steps = ["configure", "checkout", "summary"];
  const labels = ["Ostoskori", "Yhteystiedot", "Yhteenveto"];
  const current = step === "thankyou" ? 2 : steps.indexOf(step);
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

/* ─── Tilt Scent Card ───────────────────────────── */
function TiltScentCard({ scent, index, lang, onSelect, onHover, onLeave }: {
  scent: Scent; index: number; lang: "fi" | "en";
  onSelect: (s: Scent) => void;
  onHover?: (waxColor: string) => void;
  onLeave?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 220, damping: 22 });
  const smy = useSpring(my, { stiffness: 220, damping: 22 });
  const rotX = useTf(smy, v => `${(v - 0.5) * 12}deg`);
  const rotY = useTf(smx, v => `${(0.5 - v) * 12}deg`);
  const shimX = useTf(smx, v => `${v * 100}%`);
  const shimY = useTf(smy, v => `${v * 100}%`);
  return (
    <motion.button
      ref={ref}
      className="group relative flex flex-col text-left rounded-2xl border border-[var(--line)] bg-[var(--bg)] cursor-pointer overflow-hidden"
      style={{ transformStyle: "preserve-3d", perspective: "700px", rotateX: rotX, rotateY: rotY }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); onLeave?.(); }}
      onClick={() => onSelect(scent)}
      onMouseEnter={() => onHover?.(scent.waxColor)}
      whileHover={{ y: -6, scale: 1.03, borderColor: "rgba(212,169,106,0.6)", boxShadow: "0 20px 56px rgba(0,0,0,0.14)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        <Image src={scent.image} alt={lang === "fi" ? scent.name : scent.nameEn} fill
          className="object-cover transition-transform duration-500 group-hover:scale-107"
          sizes="(max-width: 768px) 50vw, 20vw" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at ${shimX} ${shimY}, rgba(255,255,255,0.15) 0%, transparent 60%)` }}
        />
        <div className="absolute inset-0 bg-[var(--ink)]/0 group-hover:bg-[var(--ink)]/15 transition-all duration-300 flex items-center justify-center">
          <span className="tag-mono text-[8px] px-2.5 py-1 rounded-full bg-[var(--bg)] text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            {lang === "fi" ? "Lue lisää" : "Learn more"}
          </span>
        </div>
      </div>
      <div className="p-3 pb-4" style={{ transform: "translateZ(10px)" }}>
        <p className="font-serif text-lg italic text-[var(--ink)] leading-tight">{lang === "fi" ? scent.name : scent.nameEn}</p>
        <p className="tag-mono text-[8px] mt-1 text-[var(--ink-mute)]">{lang === "fi" ? scent.profile : scent.profileEn}</p>
        <p className="mt-2 font-serif text-xl text-[var(--accent-2)]">{scent.price}</p>
      </div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.button>
  );
}

/* ─── Product Grid ──────────────────────────────── */
function ProductGrid({ scents, onSelect, onHover, onLeave }: {
  scents: Scent[]; onSelect: (s: Scent) => void;
  onHover?: (waxColor: string) => void;
  onLeave?: () => void;
}) {
  const { lang } = useStore();
  return (
    <section className="mb-16">
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">
        {lang === "fi" ? <><span>Tutustu </span><em>tuoksuihin</em></> : <><span>Explore the </span><em>scents</em></>}
      </h2>
      {(() => {
        const display = [...scents];
        [display[0], display[3]] = [display[3], display[0]];
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {display.map((scent, i) => (
              <TiltScentCard key={scent.id} scent={scent} index={i} lang={lang}
                onSelect={onSelect} onHover={onHover} onLeave={onLeave} />
            ))}
          </div>
        );
      })()}
    </section>
  );
}

/* ─── Quantity Stepper ──────────────────────────── */
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
        <button onClick={() => setQuantity(scent.id, qty - 1)} disabled={qty === 0}
          className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center hover:bg-[var(--bg-2)] active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed">
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
          className="w-11 h-11 rounded-full border border-[var(--accent)] bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] hover:bg-[var(--ink)] hover:border-[var(--ink)] active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Cart Item Card ────────────────────────────── */
function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  const { lang } = useStore();
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
        <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5 leading-relaxed">{scentLine}</p>
      </div>
      <button onClick={onRemove} aria-label="Poista"
        className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors p-1 mt-0.5 flex-shrink-0">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ─── Step 1: Configure ─────────────────────────── */
function ConfigureStep({
  onProceed,
  onScentHover,
  onScentLeave,
}: {
  onProceed: () => void;
  onScentHover: (waxColor: string) => void;
  onScentLeave: () => void;
}) {
  const { lang, config, setJar, addToCart, cart, removeFromCart, totalQty, cartTotalQty, cartTotalPrice } = useStore();
  const currentQty = totalQty();
  const cartQty = cartTotalQty();
  const cartPrice = cartTotalPrice();
  const jars: JarColor[] = ["white", "green", "red"];

  const handleAddToCart = () => {
    if (currentQty === 0) return;
    addToCart(config.jar, { ...config.quantities });
  };

  return (
    <div>
      <ProgressBar step="configure" />

      {/* ── Product Grid ── */}
      <ProductGrid scents={SCENTS} onSelect={useStore.getState().openModal}
        onHover={onScentHover} onLeave={onScentLeave} />

      <div className="divider mb-16" />

      <div id="configurator" className="grid md:grid-cols-2 gap-10 items-start">
        {/* Left: Configurator */}
        <div>
          <p className="tag-mono mb-2">{lang === "fi" ? "Lisää koriin" : "Add to cart"}</p>
          <h2 className="heading-display text-3xl md:text-4xl mb-8 text-[var(--ink)]">
            {lang === "fi" ? <><span>Kokoa oma </span><em>tilauksesi</em></> : <><span>Build your </span><em>order</em></>}
          </h2>

          {/* Jar selector */}
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
                <button key={jar} onClick={() => setJar(jar)}
                  className={["flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                    config.jar === jar ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line)] hover:border-[var(--accent-3)]"].join(" ")}>
                  <div className="w-14 h-18"><CandleSVG jar={jar} animate={false} /></div>
                  <span className="tag-mono text-[8px] text-[var(--ink-soft)]">{JAR_LABELS[jar][lang]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scent steppers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="tag-mono text-[8px] text-[var(--ink-mute)]">
                {lang === "fi" ? "Valitse tuoksut" : "Choose scents"}
              </p>
              <span className={`tag-mono text-[9px] ${currentQty >= 6 ? "text-[var(--accent-2)]" : "text-[var(--ink-mute)]"}`}>
                {currentQty}/6
              </span>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4">
              {SCENTS.map((scent) => <QuantityStepper key={scent.id} scent={scent} />)}
            </div>
          </div>

          <button onClick={handleAddToCart} disabled={currentQty === 0}
            className="w-full py-3.5 bg-[var(--accent)] text-[var(--bg)] font-mono text-[10px] tracking-[0.15em] uppercase rounded-full hover:bg-[var(--ink)] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
            {lang === "fi" ? "+ Lisää koriin" : "+ Add to cart"}
          </button>
        </div>

        {/* Right: Cart */}
        <div className="md:sticky md:top-24">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <p className="tag-mono text-[9px]">{lang === "fi" ? "Ostoskori" : "Cart"}</p>
              <p className="tag-mono text-[9px] text-[var(--ink-mute)]">
                {cartQty} {lang === "fi" ? "kynttilää" : "candles"}
              </p>
            </div>

            <div className="px-6 min-h-[100px]">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-xs text-[var(--ink-mute)] italic font-serif">
                  {lang === "fi" ? "Kori on tyhjä" : "Cart is empty"}
                </p>
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
                        <th key={n} className="tag-mono text-[7px] text-[var(--ink-mute)] font-normal pb-1 pr-3 text-left">{n} kpl</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      <tr>{Object.values(PRICE_TABLE).map((p, i) => (
                        <td key={i} className={`font-serif italic text-sm pr-3 ${i + 1 === cartQty ? "text-[var(--accent-2)]" : "text-[var(--ink-mute)]"}`}>{p}€</td>
                      ))}</tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="tag-mono text-[8px] text-[var(--ink-mute)]">{lang === "fi" ? "Yhteensä" : "Total"}</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={cartPrice} className="font-serif text-3xl italic text-[var(--ink)]"
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                      {cartQty > 0 ? `${cartPrice}€` : "0€"}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <button onClick={onProceed} disabled={cart.length === 0}
                className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                {lang === "fi" ? "Jatka tilaukseen →" : "Proceed to checkout →"}
              </button>
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
  const { lang } = useStore();
  const field = (key: keyof CheckoutData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData({ ...formData, [key]: e.target.value }),
  });

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} className="max-w-lg mx-auto">
      <ProgressBar step="checkout" />
      <button onClick={onBack} className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] flex items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {lang === "fi" ? "Takaisin" : "Back"}
      </button>
      <p className="tag-mono mb-2">{lang === "fi" ? "Yhteystiedot" : "Contact details"}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">
        {lang === "fi" ? <><span>Toimitus ja </span><em>tiedot</em></> : <><span>Delivery and </span><em>details</em></>}
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Etunimi" required {...field("firstName")} />
          <InputField label="Sukunimi" required {...field("lastName")} />
        </div>
        <InputField label="Sähköposti" type="email" required {...field("email")} />
        <InputField label="Osoite" required {...field("address")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Postinumero" required {...field("zip")} />
          <InputField label="Kaupunki" required {...field("city")} />
        </div>
        <div className="flex items-start gap-3 pt-3 pb-1">
          <input type="checkbox" id="delivery" checked={formData.wantsDelivery}
            onChange={(e) => setFormData({ ...formData, wantsDelivery: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[var(--accent)] cursor-pointer flex-shrink-0" />
          <label htmlFor="delivery" className="cursor-pointer">
            <p className="text-sm text-[var(--ink)]">Tarvitsen kuljetuksen</p>
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5">Postitus +8€</p>
          </label>
        </div>
        <div className="flex items-start gap-3 pb-1">
          <input type="checkbox" id="personalMsg" checked={formData.wantsPersonalMessage}
            onChange={(e) => setFormData({ ...formData, wantsPersonalMessage: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[var(--accent)] cursor-pointer flex-shrink-0" />
          <label htmlFor="personalMsg" className="cursor-pointer">
            <p className="text-sm text-[var(--ink)]">Haluan itsekirjoitetun viestin sinetöityyn kuoreen</p>
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-0.5">Käsinkirjoitettu viesti lisätään tilaukseen</p>
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
            <label className="tag-mono text-[8px] text-[var(--ink-mute)] block mb-1.5">Kirjoita viestisi</label>
            <textarea
              value={formData.personalMessage}
              onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors resize-none leading-relaxed"
            />
            <p className="tag-mono text-[8px] text-[var(--ink-mute)] mt-1.5">
              Erottele viestit numeroilla, esim: 1. Hyvää syntymäpäivää! 2. Rakastan sinua...
            </p>
          </motion.div>
        )}
        <div className="pt-4 border-t border-[var(--line)]">
          <button type="submit"
            className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200">
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
  const { lang } = useStore();
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
      <button onClick={onBack} className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] flex items-center gap-1.5 mb-8 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M6 10L2 6l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {lang === "fi" ? "Takaisin" : "Back"}
      </button>
      <p className="tag-mono mb-2">{lang === "fi" ? "Tarkista tilauksesi ennen vahvistusta" : "Review before confirming"}</p>
      <h2 className="heading-display text-4xl md:text-5xl mb-10 text-[var(--ink)]">Yhteenveto</h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Order details */}
        <div className="space-y-8">
          <div>
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-3">Purkkivalinnat</p>
            {(["white", "green", "red"] as JarColor[]).map((color) =>
              colorCounts[color] > 0 ? (
                <div key={color} className="flex justify-between items-center py-2.5 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                    <span className="text-sm text-[var(--ink)]">{JAR_ADJ[color]} purkkeja</span>
                  </div>
                  <span className="font-serif italic text-xl text-[var(--ink)]">{colorCounts[color]} kpl</span>
                </div>
              ) : null
            )}
          </div>

          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            const scentItems = SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0);
            return (
              <div key={color}>
                <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-3">
                  Tuoksut ({JAR_LABELS[color].fi})
                </p>
                {scentItems.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[var(--line)] last:border-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={s.image} alt={s.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <span className="font-serif italic text-sm text-[var(--ink)] flex-1">{s.name}</span>
                    <span className="tag-mono text-[8px] text-[var(--ink-mute)]">×{colorScents[color][s.id]}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: Pricing + actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6 space-y-3">
            <Row label="Kynttilät" value={`${basePrice}€`} />
            {discountApplied && <Row label="Alennus (15%)" value={`-${discountAmount}€`} />}
            {formData.wantsDelivery && <Row label="Toimitus" value="+8€" />}
            <div className="border-t border-[var(--line)] pt-3 flex justify-between items-baseline">
              <span className="tag-mono text-[9px] text-[var(--ink-mute)]">Hinta yhteensä</span>
              <AnimatePresence mode="wait">
                <motion.span key={finalPrice} className="font-serif text-3xl italic text-[var(--ink)]"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                  {finalPrice}€
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div>
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-2">Alekoodi</p>
            {discountApplied ? (
              <motion.p className="text-sm text-[var(--accent)] font-serif italic"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ✓ Alennus 15% lisätty
              </motion.p>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(false); }}
                  className={["flex-1 px-4 py-2.5 rounded-xl border bg-[var(--bg)] text-[var(--ink)] text-sm font-mono focus:outline-none transition-colors",
                    discountError ? "border-red-400 focus:border-red-400" : "border-[var(--line)] focus:border-[var(--accent-2)]"].join(" ")} />
                <button onClick={handleApply}
                  className="px-4 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.1em] uppercase rounded-xl hover:bg-[var(--accent)] transition-colors">
                  OK
                </button>
              </div>
            )}
            {discountError && (
              <p className="tag-mono text-[8px] text-red-400 mt-1.5">Virheellinen koodi</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5">
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-3">Yhteystiedot</p>
            <Row label="Nimi" value={`${formData.firstName} ${formData.lastName}`} />
            <Row label="Sähköposti" value={formData.email} />
            <Row label="Osoite" value={formData.address} />
            <Row label="Postinumero ja kaupunki" value={`${formData.zip} ${formData.city}`} />
            <Row label="Postitus" value={formData.wantsDelivery ? "Kyllä" : "Ei"} />
            {formData.wantsPersonalMessage && formData.personalMessage && (
              <div className="py-1.5 border-b border-[var(--line)]">
                <span className="tag-mono text-[8px] text-[var(--ink-mute)] block mb-1">Henkilökohtainen viesti</span>
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">{formData.personalMessage}</p>
              </div>
            )}
            <Row label="Hinta" value={`${finalPrice}€`} />
          </div>

          <div className="flex items-start gap-3 py-1">
            <input type="checkbox" id="privacyConsent" checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--accent)] cursor-pointer flex-shrink-0" />
            <label htmlFor="privacyConsent" className="cursor-pointer text-sm text-[var(--ink-soft)] leading-snug">
              Olen lukenut ja hyväksyn, että tiedot käsitellään{" "}
              <PrivacyLink className="underline underline-offset-2 text-[var(--ink)] hover:text-[var(--accent-2)] transition-colors">
                tietosuojaselosteen
              </PrivacyLink>{" "}
              mukaisesti
            </label>
          </div>

          {submitError && (
            <p className="text-sm text-red-500 text-center leading-snug" role="alert">
              Tilauksen lähetys epäonnistui, tarkista yhteys ja yritä uudelleen.
            </p>
          )}

          <button onClick={() => onConfirm(finalPrice)} disabled={!privacyAccepted || isSubmitting}
            className="w-full py-4 bg-[var(--accent)] text-[var(--bg)] font-mono text-[11px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--ink)] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? "Käsitellään…" : "Vahvista tilaus →"}
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
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14l6 6 12-12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="heading-display text-4xl md:text-5xl text-[var(--ink)] mb-3">
          Kiitos tilauksestasi{" "}<em>{formData.firstName}</em>!
        </h1>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          Olemme vastaanottaneet tilauksesi ja lähetämme vahvistuksen osoitteeseen:{" "}
          <span className="font-mono text-sm text-[var(--ink)]">{formData.email}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
          <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-4">Tilauksesi sisältö</p>
          {(["white", "green", "red"] as JarColor[]).map((color) => {
            if (colorCounts[color] === 0) return null;
            return (
              <div key={color} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${JAR_DOT[color]}`} />
                  <p className="font-serif italic text-sm text-[var(--ink)]">
                    {JAR_LABELS[color].fi}, {colorCounts[color]} kpl
                  </p>
                </div>
                {SCENTS.filter((s) => (colorScents[color][s.id] ?? 0) > 0).map((s) => (
                  <p key={s.id} className="tag-mono text-[8px] text-[var(--ink-mute)] ml-5 leading-relaxed">
                    {s.name} ×{colorScents[color][s.id]}
                  </p>
                ))}
              </div>
            );
          })}
          <div className="border-t border-[var(--line)] pt-4 mt-4 flex justify-between items-baseline">
            <span className="tag-mono text-[9px] text-[var(--ink-mute)]">
              {formData.wantsDelivery ? "Hinta (sis. toimitus)" : "Hinta yhteensä"}
            </span>
            <span className="font-serif text-2xl italic text-[var(--ink)]">{finalPrice}€</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-6">
            <p className="tag-mono text-[9px] text-[var(--ink-mute)] mb-4">Maksutavat</p>
            <div className="space-y-3 text-sm text-[var(--ink-soft)]">
              <p>💵 Käteinen (toimituksen yhteydessä)</p>
              <p>📱 MobilePay: <span className="font-mono text-[var(--ink)]">+358505418295</span></p>
              <p>📲 Siirto-sovellus: <span className="font-mono text-[var(--ink)]">+358505418295</span></p>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[var(--bg-3)]/60 border border-[var(--line)]">
              <p className="tag-mono text-[8px] text-[var(--ink-mute)] leading-relaxed">
                📌 Mainitse maksussa oma nimesi, jotta voimme yhdistää sen tilaukseesi.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-5 space-y-2">
            <p className="text-sm text-[var(--ink-soft)]">
              📦 <strong className="text-[var(--ink)]">Toimitusaika:</strong>{" "}
              Toimitus Oulun alueella henkilökohtaisesti tai postitse 5-7 arkipäivän kuluessa.
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              💬 <strong className="text-[var(--ink)]">Kysyttävää?</strong>{" "}
              <a href="mailto:leimucandles@gmail.com"
                className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
                leimucandles@gmail.com
              </a>
            </p>
          </div>
          <p className="text-center font-serif italic text-[var(--ink-mute)] text-sm px-2">
            Tuoksuisia hetkiä ja kiitos kun tuet LEIMU Candlesia! ✦
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────── */
export function TuotteetClient() {
  const { openModal, cart, cartTotalQty, cartTotalPrice, clearCart } = useStore();
  const [step, setStep] = useState<"configure" | "checkout" | "summary" | "thankyou">("configure");
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

  /* Fluid background state, driven by scent map hover */
  const [hoveredWaxColor, setHoveredWaxColor] = useState<string | null>(null);

  // suppress unused warning
  void openModal; void cartTotalQty; void cartTotalPrice;

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
      setStep("thankyou");
    } catch (error) {
      console.error("Tilauksen lähetys epäonnistui:", error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    setStep("configure");
    setFormData({ firstName: "", lastName: "", email: "", address: "", zip: "", city: "", wantsDelivery: false, wantsPersonalMessage: false, personalMessage: "" });
    setDiscountCode("");
    setDiscountApplied(false);
    setDiscountError(false);
  };

  return (
    <div className="calm-headings">
      {/* ── Fluid ambient background (behind everything) ── */}
      <FluidBackground waxColor={hoveredWaxColor} />

      <ScentModal />

      {/* ── Sticky "Living Still Life" hero (z-0) ── */}
      <ProductsHero />

      {/* ── Content shell, glides up and over the sticky hero (opaque, higher z) ── */}
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)]">
        {/* warm hairline seam where the content rises over the hero */}
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
                onProceed={() => setStep("checkout")}
                onScentHover={setHoveredWaxColor}
                onScentLeave={() => setHoveredWaxColor(null)}
              />
            </motion.div>
          )}
          {step === "checkout" && (
            <motion.div key="checkout">
              <CheckoutStep formData={formData} setFormData={setFormData}
                onBack={() => setStep("configure")} onNext={() => setStep("summary")} />
            </motion.div>
          )}
          {step === "summary" && (
            <motion.div key="summary">
              <SummaryStep cart={cart} formData={formData}
                discountCode={discountCode} setDiscountCode={setDiscountCode}
                discountApplied={discountApplied} setDiscountApplied={setDiscountApplied}
                discountError={discountError} setDiscountError={setDiscountError}
                onBack={() => setStep("checkout")} onConfirm={handleConfirm}
                isSubmitting={isSubmitting} submitError={submitError} />
            </motion.div>
          )}
          {step === "thankyou" && (
            <motion.div key="thankyou">
              <ThankyouStep formData={formData} orderSnapshot={orderSnapshot} finalPrice={confirmedPrice} />
              <div className="mt-12 text-center">
                <button onClick={resetOrder}
                  className="tag-mono text-[9px] text-[var(--ink-mute)] hover:text-[var(--ink)] underline underline-offset-4 transition-colors">
                  Tee uusi tilaus
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Process video ───────────────────────────── */}
      <div className="border-t border-[var(--line)] py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-[var(--line)] shadow-2xl mx-auto md:mx-0"
            style={{ aspectRatio: "9 / 16", maxWidth: 340 }}
            initial={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={VIEWPORT_NEAR}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <video src="/images/Valmistus.mp4" autoPlay muted loop playsInline preload="metadata"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,24,20,0.35)] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5">
              <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-white/60">
                Oulu · Studio
              </span>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-7"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            <h2 className="font-serif text-4xl md:text-5xl italic leading-[1.1] text-[var(--ink)]">
              Käsityötä,<br />
              <em style={{ color: "var(--accent-2)" }}>hetki kerrallaan.</em>
            </h2>
            <div className="space-y-4 text-[var(--ink-soft)] leading-relaxed">
              <p>
                Jokainen LEIMU syntyy käsin, ei linjastolla, ei erissä,
                vaan yksi purkki kerrallaan. Vaha sulatetaan oikeassa
                lämpötilassa, tuoksuöljyt sekoitetaan huolella ja sydän
                asetetaan tarkalleen keskelle.
              </p>
              <p>
                Sen jälkeen alkaa hiljaisin vaihe:{" "}
                <span className="text-[var(--ink)] font-medium">cure</span>.
                Viikko pimeässä, rauhassa, jonka aikana tuoksu kypsyy
                ja vaha löytää lopullisen muotonsa.
              </p>
              <p>
                Tämä on hidas tapa tehdä kynttilöitä.{" "}
                <em className="not-italic font-medium text-[var(--ink)]">
                  Ainoa tapa, jolla LEIMU haluaa ne tehdä.
                </em>
              </p>
            </div>
            <div className="flex gap-8 pt-4 border-t border-[var(--line)]">
              {[
                { val: "1", label: "kerrallaan" },
                { val: "7 pv", label: "cure-vaihe" },
                { val: "100%", label: "käsityö" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="font-serif text-2xl italic text-[var(--ink)] leading-none">{val}</p>
                  <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-mute)] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Luxury gift section ──────────────────────── */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto py-24 border-t border-[var(--line)]">
        <motion.div
          className="grid md:grid-cols-3 gap-5 mb-24"
          initial={{ opacity: 0, y: 24, filter: "blur(5px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { src: "/images/3-kynttilaata.png", alt: "LEIMU kynttilät", offset: "md:mt-0" },
            { src: "/images/process-5.jpg", alt: "Kynttilät valmiina", offset: "md:mt-10" },
            { src: "/images/launch-kuva.png", alt: "LEIMU launch", offset: "md:mt-4" },
          ].map(({ src, alt, offset }, i) => (
            <motion.div key={src}
              className={`relative rounded-2xl overflow-hidden border border-[var(--line)] ${offset}`}
              style={{ aspectRatio: "3/4" }}
              whileHover={{ scale: 1.02, boxShadow: "0 28px 72px rgba(0,0,0,0.14)" }}
              initial={{ opacity: 0, y: 28, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={VIEWPORT_NEAR}
              transition={{ duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              custom={i}
            >
              <Image src={src} alt={alt} fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            <motion.p variants={fadeUpItem} className="tag-mono text-[var(--accent)] mb-3">Luksusta arjen keskelle</motion.p>
            <motion.h2 variants={headingReveal} className="heading-display text-4xl md:text-5xl mb-8 text-[var(--ink)]">
              Enemmän kuin<br /><em>pelkkä kynttilä.</em>
            </motion.h2>
            <div className="space-y-5 text-[var(--ink-soft)] leading-relaxed">
              <p className="text-lg">
                LEIMU on pala luksusta arjen keskelle, hetki, joka kuuluu vain sinulle.
                Jokainen kynttilä saapuu <span className="text-[var(--ink)] font-medium">tyylikkäässä lahjapussissa</span>,
                joka on viimeistelty viimeistä yksityiskohtaa myöten.
              </p>
              <p>
                Kiitoskortti on kuoressa, jonka sulkee
                {" "}<span className="text-[var(--ink)] font-medium">käsinleimattu vahasinetti</span>, LEIMU-logolla koristeltu,
                aito leima, joka tekee jokaisesta tilauksesta pienen seremonian.
              </p>
              <p>
                Sopii täydellisesti lahjaksi rakkaalle tai itsensä hemmotteluun.
                Koska jokainen ansaitsee hetken, joka tuntuu erityiseltä.
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href="#configurator"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200">
                Tee tilaus
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <span className="flex items-center gap-2 tag-mono text-[9px] text-[var(--ink-mute)]">
                ✦ Ilmainen lahjapussi jokaiseen tilaukseen
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative rounded-3xl overflow-hidden border border-[var(--line)]"
            style={{ aspectRatio: "1 / 1.1" }}
            initial={{ opacity: 0, x: 36, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={VIEWPORT_NEAR}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
          >
            <Image src="/images/Lahjasetti mainos.png" alt="LEIMU lahjasetti" fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/15" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                <span className="tag-mono text-[8px] text-white">✦ Tyylikäs lahjapussi + vahasinetti</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}
