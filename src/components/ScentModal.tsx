"use client";

import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Variants } from "framer-motion";
import { useStore } from "@/context/store";
import { notesLine } from "@/lib/scents";
import { scrollToTarget } from "@/lib/scroll";
import { EASE_IN_EXPO, SPRING_PREMIUM } from "@/lib/motionVariants";
import { CaptionPlaque } from "@/components/ScentFrame";
import { Dialog } from "@/components/Dialog";

const card: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_PREMIUM },
  exit:    { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18, ease: EASE_IN_EXPO } },
};

export function ScentModal() {
  const modalScent = useStore((s) => s.modalScent);
  const closeModal = useStore((s) => s.closeModal);
  const setQuantity = useStore((s) => s.setQuantity);
  const config = useStore((s) => s.config);
  const totalQty = useStore((s) => s.totalQty);
  const lang = useStore((s) => s.lang);
  const router = useRouter();
  const currentQty = modalScent ? (config.quantities[modalScent.id] ?? 0) : 0;
  const total = totalQty();

  // Picks the scent, then glides to the configurator. On pages without one
  // (home) it opens /tuotteet at the configurator instead.
  const handleAddAndClose = () => {
    if (!modalScent) return;
    if (currentQty === 0 && total < 6) setQuantity(modalScent.id, 1);
    closeModal();
    setTimeout(() => {
      const configurator = document.getElementById("configurator");
      if (configurator) scrollToTarget(configurator);
      else router.push("/tuotteet#configurator");
    }, 120);
  };

  return (
    <Dialog
      open={!!modalScent}
      onClose={closeModal}
      label={
        modalScent
          ? lang === "fi"
            ? `Tuoksukortti: ${modalScent.name}`
            : `Scent card: ${modalScent.nameEn}`
          : ""
      }
      backdropClassName="bg-[rgba(20,17,13,0.72)] backdrop-blur-md"
      panelClassName="max-w-3xl glass overflow-hidden rounded-2xl"
      panelVariants={card}
    >
      {modalScent && (
        <>
          <button
            onClick={closeModal}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(247,242,234,0.22)] bg-[rgba(20,17,13,0.45)] text-[var(--on-dark)] transition-colors hover:bg-[rgba(20,17,13,0.7)]"
            aria-label={lang === "fi" ? "Sulje" : "Close"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[280px] overflow-hidden bg-[var(--ink)]">
              <Image
                src={modalScent.image}
                alt={lang === "fi" ? modalScent.name : modalScent.nameEn}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <CaptionPlaque tone="paper">
                  <p className="font-serif text-3xl leading-none text-[var(--ink)]">
                    {lang === "fi" ? modalScent.name : modalScent.nameEn}
                  </p>
                  <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--ink-mute)]">
                    {notesLine(lang === "fi" ? modalScent.profile : modalScent.profileEn)}
                  </p>
                </CaptionPlaque>
              </div>
            </div>

            <div className="flex flex-col gap-5 bg-[var(--plaque)] p-8 text-white">
              <div>
                <p className="tag-mono mb-2 !text-white">
                  {lang === "fi" ? "Tuoksu" : "Scent"}
                </p>
                <p className="text-sm leading-relaxed text-white">
                  {lang === "fi" ? modalScent.description : modalScent.descriptionEn}
                </p>
              </div>

              <div>
                <p className="tag-mono mb-2 !text-white">
                  {lang === "fi" ? "Materiaalit" : "Materials"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "fi" ? modalScent.tags : modalScent.tagsEn).map((tag) => (
                    <span
                      key={tag}
                      className="tag-mono rounded-full border border-white/25 px-2.5 py-1 text-[12px] !text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
                {[
                  { label: lang === "fi" ? "Paloaika" : "Burn time", value: modalScent.burnTime },
                  { label: lang === "fi" ? "Hinta / kpl" : "Price / ea", value: modalScent.price },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="tag-mono mb-0.5 text-[12px] !text-white">{label}</p>
                    <p className="font-serif text-xl italic text-white">{value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddAndClose}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--ink)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--bg)] active:scale-[0.98]"
              >
                {lang === "fi" ? "Valitse tuoksu" : "Choose scent"}
                <ArrowRight size={14} weight="light" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
