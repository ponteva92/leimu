"use client";

/* Mounts the single global ContactModal, driven by the Zustand store so any
   "Ota yhteyttä" CTA (navbar, hero, …) can open it. */

import { useStore } from "@/context/store";
import { ContactModal } from "@/components/ContactModal";

export function ContactModalHost() {
  const { contactOpen, closeContact } = useStore();
  if (!contactOpen) return null;
  return <ContactModal onClose={closeContact} />;
}
