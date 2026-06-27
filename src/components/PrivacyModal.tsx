"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Privacy policy content ────────────────────── */
function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm text-[var(--ink-soft)] leading-relaxed">
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Rekisterinpitäjä</p>
        <p className="font-serif text-lg italic text-[var(--ink)] mb-1">LEIMU By Shane</p>
        <p>Y-tunnus: 3565713-3</p>
        <div className="flex flex-col gap-0.5 mt-2">
          <a href="mailto:leimucandles@gmail.com" className="hover:text-[var(--accent-2)] transition-colors">
            📧 leimucandles@gmail.com
          </a>
          <span>📞 +358 46 5901602</span>
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Yleistä</p>
        <p>
          LEIMU By Shane käsittelee henkilötietoja EU:n tietosuoja-asetuksen (GDPR) ja Suomen
          tietosuojalain mukaisesti. Tietoja kerätään vain yhteydenottojen, uutiskirjeiden ja
          tilausten käsittelyyn.
        </p>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Kerättävät tiedot</p>
        <ul className="space-y-1 pl-4">
          <li className="list-disc">Nimi ja sähköposti yhteydenottoihin ja uutiskirjeisiin</li>
          <li className="list-disc">Nimi, sähköposti ja toimitusosoite tilauksia varten</li>
        </ul>
        <p className="mt-3">
          Tietoja ei käytetä mainontaan eikä luovuteta kolmansille osapuolille markkinointitarkoituksiin.
        </p>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Käsittely ja säilytys</p>
        <p>
          Tietoja käsitellään Framer-, Tally- ja Google Sheets -palveluissa. Kaikki palvelut noudattavat
          EU:n tietosuojavaatimuksia. Säilytämme tiedot vain lain ja käyttötarkoituksen edellyttämän ajan.
        </p>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Evästeet</p>
        <p>
          Sivustomme käyttää vain toiminnallisia evästeitä, jotka mahdollistavat sivun teknisen toiminnan.
        </p>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Oikeutesi</p>
        <p>
          Sinulla on oikeus tarkistaa, oikaista ja poistaa tietosi sekä peruuttaa suostumuksesi
          uutiskirjeeseen. Pyynnöt:{" "}
          <a href="mailto:leimucandles@gmail.com" className="hover:text-[var(--accent-2)] transition-colors underline underline-offset-2">
            leimucandles@gmail.com
          </a>
        </p>
      </div>

      <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--ink-mute)] pt-4 border-t border-[var(--line)]">
        Pidätämme oikeuden päivittää tätä selostetta tarvittaessa.
        Viimeksi päivitetty: 14.10.2025
      </p>
    </div>
  );
}

/* ─── Modal overlay ─────────────────────────────── */
function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[rgba(26,24,20,0.65)] backdrop-blur-sm" />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-lg bg-[var(--bg)] rounded-2xl border border-[var(--line)] shadow-modal overflow-hidden"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">
                Asiakirja
              </p>
              <h2 className="font-serif text-xl italic text-[var(--ink)]">Tietosuojaseloste</h2>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              aria-label="Sulje"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <PrivacyContent />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Public: PrivacyLink ───────────────────────── */
/**
 * Renders `children` as a clickable trigger. On click, opens the
 * Tietosuojaseloste modal. Accepts any className for styling.
 *
 * Usage (footer link):
 *   <PrivacyLink className="text-sm text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors">
 *     Tietosuojaseloste
 *   </PrivacyLink>
 *
 * Usage (inline in text — e.g. GDPR checkbox):
 *   <PrivacyLink className="underline underline-offset-2 hover:text-[var(--accent-2)] transition-colors">
 *     tietosuojaselosteen
 *   </PrivacyLink>
 */
export function PrivacyLink({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      {open && <PrivacyModal onClose={() => setOpen(false)} />}
    </>
  );
}
