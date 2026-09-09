"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitForm } from "@/lib/formSubmit";

export function ContactModal({ onClose }: { onClose: () => void }) {
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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Frosted glass backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/40"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        />

        <motion.div
          className="relative z-10 w-full max-w-lg bg-[var(--bg)] rounded-xl border border-[var(--line)] shadow-modal overflow-hidden"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--ink-mute)] mb-0.5">LEIMU by Shane</p>
              <h2 className="font-serif text-xl italic text-[var(--ink)]">Yhteydenottopyyntö</h2>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              aria-label="Sulje"
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
                    className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4 10-10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <p className="font-serif text-2xl italic text-[var(--ink)] mb-3">Kiitos yhteydenotosta!</p>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-sm mx-auto">
                    Palautteesi on meille tärkeä, joten käsittelemme viestisi ja olemme sinuun yhteydessä tarvittaessa.{" "}
                    <em className="not-italic font-medium text-[var(--ink)]">Kiitos!</em>
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
                      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">Nimi</label>
                      <input required value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">Sähköposti</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors disabled:opacity-50"/>
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">Mitä asia koskee?</label>
                    <input required value={subject} onChange={e => setSubject(e.target.value)} disabled={isSubmitting}
                      placeholder="Esim. tilaus, yhteistyö, kysymys..."
                      className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors placeholder:text-[var(--ink-mute)] disabled:opacity-50"/>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--ink-mute)] block mb-2">Kerro tarkemmin</label>
                    <textarea required value={message} onChange={e => setMessage(e.target.value)} disabled={isSubmitting}
                      rows={4}
                      className="w-full px-4 py-3 rounded-md border border-[var(--field-border)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--accent-2)] transition-colors resize-none leading-relaxed disabled:opacity-50"/>
                  </div>
                  <div className="pt-2 space-y-3">
                    {error && (
                      <p className="text-sm text-[var(--destructive)] text-center leading-snug" role="alert">
                        Viestin lähetys epäonnistui, tarkista yhteys ja yritä uudelleen.
                      </p>
                    )}
                    <button type="submit" disabled={isSubmitting}
                      className="w-full py-3.5 bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent)] transition-colors duration-200 disabled:opacity-50 flex justify-center items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Lähetetään…
                        </>
                      ) : "LÄHETÄ →"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}