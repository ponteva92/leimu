"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";

export function Navbar({
  scrolled,
  tone = "paper",
}: {
  scrolled: boolean;
  tone?: "paper" | "dark";
}) {
  const pathname = usePathname();
  const lang = useStore((s) => s.lang);
  const toggleLang = useStore((s) => s.toggleLang);
  const dark = tone === "dark";

  const links = [
    { href: "/", label: { fi: "Etusivu", en: "Home" } },
    { href: "/tuotteet", label: { fi: "Tuotteet", en: "Products" } },
    { href: "/tarina", label: { fi: "Tarina", en: "Story" } },
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const mobileLinks = [
    { href: "/", label: { fi: "Etusivu", en: "Home" } },
    { href: "/tuotteet", label: { fi: "Tuotteet", en: "Products" } },
    { href: "/tarina", label: { fi: "Tarinamme", en: "Our story" } },
  ];
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const ink = dark ? "var(--on-dark)" : "var(--ink)";
  const mute = dark ? "rgba(247,242,234,0.78)" : "var(--ink-mute)";

  // The bar re-blurs whatever scrolls under it on every frame, and the cost
  // grows with the blur radius, so the glass stays at 16px with no saturate.
  // At 16px, detail under the bar stays sharper, so denser tints keep the
  // links legible.
  return (
    <div
      className={["relative z-30", scrolled ? "border-b border-[rgba(26,24,20,0.07)]" : ""].join(" ")}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: dark
          ? "rgba(20, 17, 13, 0.6)"
          : scrolled
            ? "rgba(247, 242, 234, 0.7)"
            : "rgba(247, 242, 234, 0.3)",
        transition:
          "background-color 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* The glass edge light and the drop shadow are layers of their own
          that fade by opacity, so the bar never animates box-shadow. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 shadow-[0_10px_36px_rgba(26,24,20,0.07)] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: scrolled && !dark ? 1 : 0 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[rgba(255,255,255,0.55)] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: scrolled && !dark ? 1 : 0 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[rgba(255,255,255,0.08)] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: dark ? 1 : 0 }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="group flex items-center" aria-label={lang === "fi" ? "LEIMU etusivu" : "LEIMU home"}>
          <motion.div
            className="relative overflow-hidden rounded-md"
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.04 }, tap: { scale: 0.97 } }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Image
              src={dark ? "/images/leimu-logo-white.png" : "/images/logo.png"}
              alt="LEIMU"
              width={90}
              height={36}
              className="h-[54px] w-auto object-contain transition-opacity duration-300 group-hover:opacity-85"
              priority
            />
          </motion.div>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" role="navigation">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className="group relative font-sans text-[13px] font-medium uppercase tracking-[0.08em] outline-none"
              >
                <span
                  className="transition-colors duration-200"
                  style={{ color: isActive ? ink : mute }}
                >
                  {link.label[lang]}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <motion.button
            onClick={toggleLang}
            className="cursor-pointer font-sans text-[13px] font-medium tracking-[0.06em] transition-colors"
            style={{ color: mute }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label={lang === "fi" ? "Vaihda kieli: EN" : "Change language: FI"}
          >
            <span style={{ color: lang === "fi" ? ink : undefined }}>FI</span>
            <span className="mx-1.5 opacity-40">/</span>
            <span style={{ color: lang === "en" ? ink : undefined }}>EN</span>
          </motion.button>

          <Link href="/tuotteet" passHref legacyBehavior>
            <motion.a
              className="inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full px-4 py-2 font-sans text-[13px] font-medium uppercase tracking-[0.08em] md:px-5"
              style={{
                backgroundColor: dark ? "var(--on-dark)" : "var(--ink)",
                color: dark ? "var(--ink)" : "var(--bg)",
                boxShadow: "0 2px 16px rgba(26,24,20,0.14)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {lang === "fi" ? "Tilaa" : "Order"}
                <ArrowRight size={12} weight="light" aria-hidden="true" />
              </span>
            </motion.a>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors md:hidden"
            style={{
              borderColor: dark ? "rgba(247,242,234,0.28)" : "var(--line)",
              backgroundColor: dark ? "rgba(20,17,13,0.45)" : "rgba(247,242,234,0.7)",
              color: ink,
            }}
            aria-label={
              lang === "fi"
                ? menuOpen
                  ? "Sulje valikko"
                  : "Avaa valikko"
                : menuOpen
                  ? "Close menu"
                  : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <motion.path animate={menuOpen ? { d: "M5 5 L17 17" } : { d: "M3 6 L19 6" }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
              <motion.path d="M3 11 L19 11" animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.2 }} />
              <motion.path animate={menuOpen ? { d: "M5 17 L17 5" } : { d: "M3 16 L19 16" }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            role="navigation"
            className="absolute inset-x-0 top-full z-40 border-b border-[var(--line)] bg-[var(--bg)] shadow-[0_24px_44px_-22px_rgba(26,24,20,0.3)] md:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col px-6 py-1">
              {mobileLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "border-b border-[var(--line)] py-4 font-sans text-[14px] font-medium uppercase tracking-[0.08em] transition-colors last:border-0",
                      isActive ? "text-[var(--ink)]" : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
                    ].join(" ")}
                  >
                    {link.label[lang]}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
