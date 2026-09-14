"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitForm } from "@/lib/formSubmit";
import { COPY } from "@/lib/copy";
import { useStore } from "@/context/store";
import { useDialogTrap } from "@/lib/useDialogTrap";
import { Spinner } from "@/components/ui/Spinner";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const { lang } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const close = useCallback(() => onClose(), [onClose]);
  useDialogTrap(true, close, panelRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(false);
    try {
      await submitForm({ formType: "leimu-contact", name, email, subject, message, website });
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={close}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/40"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        />

        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
          className="relative z-10 w-full max-w-lg bg-[var(--bg)] rounded-2xl border border-[var(--line)] shadow-modal overflow-hidden"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">LEIMU by Shane</p>
              <h2 id="contact-title" className="font-serif text-xl italic text-[var(--ink)]">{COPY.contact.title[lang]}</h2>
            </div>
            <button
              onClick={close}
              className="w-11 h-11 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              aria-label={COPY.scent.close[lang]}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>
          </div>

          <div className="px-6 py-6">
            {submitted ? (
              <div className="py-8 text-center">
                <p className="font-serif text-2xl italic text-[var(--ink)] mb-3">{COPY.contact.thanks[lang]}</p>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-sm mx-auto">
                  {COPY.contact.thanksBody[lang]}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="company-site">Website</label>
                  <input id="company-site" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">{COPY.contact.name[lang]}</label>
                    <input id="contact-name" required value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">{COPY.contact.email[lang]}</label>
                    <input id="contact-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">{COPY.contact.subject[lang]}</label>
                  <input id="contact-subject" required value={subject} onChange={e => setSubject(e.target.value)} disabled={isSubmitting}
                    placeholder={COPY.contact.subjectPh[lang]}
                    className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors placeholder:text-[var(--ink-mute)] disabled:opacity-50"/>
                </div>
                <div>
                  <label htmlFor="contact-message" className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">{COPY.contact.message[lang]}</label>
                  <textarea id="contact-message" required value={message} onChange={e => setMessage(e.target.value)} disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors resize-none leading-relaxed disabled:opacity-50"/>
                </div>
                <div className="pt-2 space-y-3">
                  {error && (
                    <p className="text-sm text-[var(--destructive)] text-center leading-snug" role="alert">
                      {COPY.contact.fail[lang]}
                    </p>
                  )}
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? (<><Spinner size={13} /> {COPY.contact.sending[lang]}</>) : `${COPY.contact.send[lang]} →`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
