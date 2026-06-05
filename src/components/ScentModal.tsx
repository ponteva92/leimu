"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useStore } from "@/context/store";

const backdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

/**
 * Premium elastic spring: stiffness 480, damping 28, mass 0.65
 * Damping ratio ~0.55 => card overshoots ~4% and settles in ~380ms.
 */
const card = {
  hidden:  { opacity: 0, scale: 0.92, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 280, damping: 30 },
  },
  exit: {
    opacity: 0, scale: 0.96, y: 10, filter: "blur(6px)",
    transition: { duration: 0.18, ease: [0.7, 0, 0.84, 0] },
  },
};

export function ScentModal() {
  const { modalScent, closeModal, setQuantity, config, totalQty, lang, isMuted } = useStore();
  const currentQty = modalScent ? (config.quantities[modalScent.id] ?? 0) : 0;
  const total = totalQty();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); },
    [closeModal],
  );

  useEffect(() => {
    if (!modalScent) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    import("@/lib/audioService").then(({ playModalOpenSound }) =>
      playModalOpenSound(isMuted),
    );
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalScent, handleKeyDown, isMuted]);

  const handleAddAndClose = () => {
    if (!modalScent) return;
    if (currentQty === 0 && total < 6) setQuantity(modalScent.id, 1);
    closeModal();
    setTimeout(() => {
      document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <AnimatePresence>
      {modalScent && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-label={`Tuoksukortti: ${modalScent.name}`}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />

          <motion.div
            className="relative z-10 w-full max-w-3xl glass rounded-2xl overflow-hidden shadow-[var(--shadow-modal)]"
            variants={card}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/70 hover:text-white hover:bg-black/30 backdrop-blur-md transition-colors"
              aria-label="Sulje"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[260px] bg-[var(--ink)] overflow-hidden">
                <Image
                  src={modalScent.image}
                  alt={lang === "fi" ? modalScent.name : modalScent.nameEn}
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {modalScent.ambientColor && (
                  <div
                    className="absolute inset-0 opacity-20 mix-blend-multiply"
                    style={{ backgroundColor: modalScent.ambientColor }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="font-serif text-3xl italic text-white leading-none">
                    {lang === "fi" ? modalScent.name : modalScent.nameEn}
                  </p>
                  <p className="tag-mono text-[9px] text-white/60 mt-1">
                    {lang === "fi" ? modalScent.profile : modalScent.profileEn}
                  </p>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-5">
                <div>
                  <p className="tag-mono text-[9px] mb-2 text-white/55">
                    {lang === "fi" ? "Tuoksu" : "Scent"}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {lang === "fi" ? modalScent.description : modalScent.descriptionEn}
                  </p>
                </div>

                <div>
                  <p className="tag-mono text-[9px] mb-2 text-white/55">
                    {lang === "fi" ? "Materiaalit" : "Materials"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {modalScent.tags.map((tag) => (
                      <span key={tag}
                        className="tag-mono text-[9px] px-2.5 py-1 rounded-full border border-white/15 text-white/75">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  {[
                    { label: lang === "fi" ? "Paloaika" : "Burn time", value: modalScent.burnTime },
                    { label: lang === "fi" ? "Hinta / kpl" : "Price / ea", value: modalScent.price },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="tag-mono text-[8px] mb-0.5 text-white/55">{label}</p>
                      <p className="font-serif text-xl italic text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddAndClose}
                  className="mt-auto w-full py-3.5 bg-[var(--accent-2)] text-[#1A1814] font-mono text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-white transition-colors duration-300"
                >
                  {lang === "fi" ? "Valitse tuoksu" : "Choose scent"} &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
