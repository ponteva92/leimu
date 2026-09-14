"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CONTACTS } from "@/lib/contacts";
import { COPY } from "@/lib/copy";
import { useStore } from "@/context/store";
import { useDialogTrap } from "@/lib/useDialogTrap";

function PrivacyContent() {
  const { lang } = useStore();
  if (lang === "en") {
    return (
      <div className="space-y-6 text-sm text-[var(--ink-soft)] leading-relaxed">
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Controller</p>
          <p className="font-serif text-lg italic text-[var(--ink)] mb-1">{CONTACTS.brand}</p>
          <p>Business ID: {CONTACTS.yTunnus}</p>
          <div className="flex flex-col gap-0.5 mt-2">
            <a href={`mailto:${CONTACTS.email}`} className="hover:text-[var(--accent-2)] transition-colors">{CONTACTS.email}</a>
            <span>{CONTACTS.shopPhone}</span>
          </div>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">What we collect</p>
          <p>Name, email, and message from the contact form. For orders: name, email, optional shipping address, order contents, optional handwritten note, and payment method chosen.</p>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Processors</p>
          <p>The site runs on Next.js hosting. Order and contact payloads are forwarded to Make.com so Shane can fulfil them. The Instagram grid is loaded from Behold only after you scroll to that section.</p>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Cookies</p>
          <p>We store language, cart, and checkout progress in localStorage (not a cookie). Behold may set its own cookies when the Instagram widget loads.</p>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Your rights</p>
          <p>You may ask to see, correct, or delete your data at {CONTACTS.email}.</p>
        </div>
        <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--ink-mute)] pt-4 border-t border-[var(--line)]">
          Last updated: 14.9.2026
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6 text-sm text-[var(--ink-soft)] leading-relaxed">
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Rekisterinpitäjä</p>
        <p className="font-serif text-lg italic text-[var(--ink)] mb-1">{CONTACTS.brand}</p>
        <p>Y-tunnus: {CONTACTS.yTunnus}</p>
        <div className="flex flex-col gap-0.5 mt-2">
          <a href={`mailto:${CONTACTS.email}`} className="hover:text-[var(--accent-2)] transition-colors">{CONTACTS.email}</a>
          <span>{CONTACTS.shopPhone}</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Yleistä</p>
        <p>
          LEIMU By Shane käsittelee henkilötietoja EU:n tietosuoja-asetuksen (GDPR) ja Suomen
          tietosuojalain mukaisesti. Tietoja kerätään yhteydenottoihin ja tilausten käsittelyyn.
        </p>
      </div>
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Kerättävät tiedot</p>
        <ul className="space-y-1 pl-4">
          <li className="list-disc">Nimi ja sähköposti yhteydenottoihin</li>
          <li className="list-disc">Nimi, sähköposti, valinnainen toimitusosoite, tilauksen sisältö, valinnainen viesti ja valittu maksutapa tilauksia varten</li>
        </ul>
      </div>
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Käsittely ja säilytys</p>
        <p>
          Sivusto toimii Next.js-palvelimella. Tilaus- ja yhteydenottotiedot välitetään Make.com-palveluun tilausten hoitamista varten.
          Instagram-ruudukko ladataan Behold-palvelusta vasta, kun vierität sen kohdalle.
        </p>
      </div>
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Evästeet</p>
        <p>
          Kieli, ostoskori ja kassavaihe tallennetaan localStorageen (ei evästeeseen). Behold voi asettaa omia evästeitään, kun Instagram-upote latautuu.
        </p>
      </div>
      <div>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[var(--ink-mute)] mb-2">Oikeutesi</p>
        <p>
          Sinulla on oikeus tarkistaa, oikaista ja poistaa tietosi. Pyynnöt:{" "}
          <a href={`mailto:${CONTACTS.email}`} className="hover:text-[var(--accent-2)] transition-colors underline underline-offset-2">
            {CONTACTS.email}
          </a>
        </p>
      </div>
      <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--ink-mute)] pt-4 border-t border-[var(--line)]">
        Pidätämme oikeuden päivittää tätä selostetta tarvittaessa. Viimeksi päivitetty: 14.9.2026
      </p>
    </div>
  );
}

function PrivacyModal({ onClose }: { onClose: () => void }) {
  const { lang } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useDialogTrap(true, close, panelRef);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={close}
    >
      <div className="absolute inset-0 bg-[rgba(26,24,20,0.65)] backdrop-blur-sm" />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="relative z-10 w-full max-w-lg bg-[var(--bg)] rounded-2xl border border-[var(--line)] shadow-modal overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
          <div>
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">
              {COPY.privacy.doc[lang]}
            </p>
            <h2 id="privacy-title" className="font-serif text-xl italic text-[var(--ink)]">{COPY.privacy.title[lang]}</h2>
          </div>
          <button
            onClick={close}
            className="w-11 h-11 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
            aria-label={COPY.scent.close[lang]}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          <PrivacyContent />
        </div>
      </motion.div>
    </motion.div>
  );
}

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
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <PrivacyModal onClose={() => setOpen(false)} />}
    </>
  );
}
