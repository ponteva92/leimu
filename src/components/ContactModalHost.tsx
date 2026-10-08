"use client";

/* Mounts the single global ContactModal, driven by the Zustand store so any
   "Ota yhteyttä" CTA (navbar, hero, …) can open it. */

import { useStore } from "@/context/store";
import { ContactModal } from "@/components/ContactModal";

export function ContactModalHost() {
  const contactOpen = useStore((s) => s.contactOpen);
  const closeContact = useStore((s) => s.closeContact);
  return <ContactModal open={contactOpen} onClose={closeContact} />;
}
