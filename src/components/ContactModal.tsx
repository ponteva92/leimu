"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { submitForm } from "@/lib/formSubmit";
import { useStore } from "@/context/store";
import { Dialog } from "@/components/Dialog";

const COPY = {
  fi: {
    title: "Yhteydenottopyyntö",
    close: "Sulje",
    thanksTitle: "Kiitos yhteydenotosta!",
    thanksBody:
      "Palautteesi on meille tärkeä, joten käsittelemme viestisi ja olemme sinuun yhteydessä tarvittaessa.",
    thanksSign: "Kiitos!",
    name: "Nimi",
    email: "Sähköposti",
    subject: "Mitä asia koskee?",
    subjectHint: "Esim. tilaus, yhteistyö, kysymys...",
    message: "Kerro tarkemmin",
    error: "Viestin lähetys epäonnistui, tarkista yhteys ja yritä uudelleen.",
    sending: "Lähetetään…",
    send: "Lähetä",
  },
  en: {
    title: "Get in touch",
    close: "Close",
    thanksTitle: "Thank you for getting in touch!",
    thanksBody: "Your message matters to us. We will read it and get back to you if needed.",
    thanksSign: "Thank you!",
    name: "Name",
    email: "Email",
    subject: "What is it about?",
    subjectHint: "An order, a collaboration, a question...",
    message: "Tell us more",
    error: "Your message did not send. Check your connection and try again.",
    sending: "Sending…",
    send: "Send",
  },
} as const;

/* The panel mounts with each opening, so the form starts fresh every time. */
export function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label={COPY[lang].title}
      panelClassName="max-w-lg bg-[var(--bg)] rounded-2xl border border-[var(--line)] shadow-modal overflow-hidden"
    >
      <ContactPanel onClose={onClose} />
    </Dialog>
  );
}

function ContactPanel({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang] ?? COPY.fi;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Estetään tuplalähetykset
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(false);

    try {
      await submitForm({ formType: "leimu-contact", name, email, subject, message });
      // Näytetään kiitos-animaatio vasta kun Netlify on vastannut 200 OK
      setSubmitted(true);
    } catch (err) {
      console.error("Virhe lähetettäessä lomaketta:", err);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
        <div>
          <p className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-mute)] mb-0.5">LEIMU by Shane</p>
          <h2 className="font-serif text-xl italic text-[var(--ink)]">{t.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
          aria-label={t.close}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </button>
      </div>

      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="thanks"
              className="py-8 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-[rgba(46,61,42,0.1)] flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l4 4 10-10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <p className="font-serif text-2xl italic text-[var(--ink)] mb-3">{t.thanksTitle}</p>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-sm mx-auto">
                {t.thanksBody}{" "}
                <em className="not-italic font-medium text-[var(--ink)]">{t.thanksSign}</em>
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-mute)] block mb-2">{t.name}</label>
                  <input required id="contact-name" value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                </div>
                <div>
                  <label htmlFor="contact-email" className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-mute)] block mb-2">{t.email}</label>
                  <input type="email" required id="contact-email" value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-mute)] block mb-2">{t.subject}</label>
                <input required id="contact-subject" value={subject} onChange={e => setSubject(e.target.value)} disabled={isSubmitting}
                  placeholder={t.subjectHint}
                  className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors placeholder:text-[var(--ink-mute)] disabled:opacity-50"/>
              </div>
              <div>
                <label htmlFor="contact-message" className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-mute)] block mb-2">{t.message}</label>
                <textarea required id="contact-message" value={message} onChange={e => setMessage(e.target.value)} disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors resize-none leading-relaxed disabled:opacity-50"/>
              </div>
              <div className="pt-2 space-y-3">
                {error && (
                  <p className="text-sm text-[var(--destructive)] text-center leading-snug" role="alert">
                    {t.error}
                  </p>
                )}
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-3.5 bg-[var(--ink)] text-[var(--bg)] font-sans font-medium text-[13px] tracking-[0.08em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200 disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      {t.sending}
                    </>
                  ) : (
                    <>
                      {t.send}
                      <ArrowRight size={13} weight="light" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}