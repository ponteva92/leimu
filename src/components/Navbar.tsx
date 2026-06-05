"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/store";
import { ContactCTA } from "@/components/ContactCTA";

/* The inner nav bar. Positioning + scroll-reveal live in SiteHeader; this just
   reacts to `scrolled` for its frosted-glass background. */
export function Navbar({ scrolled }: { scrolled: boolean }) {
  const pathname = usePathname();
  const { lang, toggleLang } = useStore();

  const links = [
    { href: "/",         label: { fi: "Etusivu",  en: "Home"     } },
    { href: "/tuotteet", label: { fi: "Tuotteet", en: "Products" } },
    { href: "/tarina",   label: { fi: "Tarina",   en: "Story"    } },
  ];

  /* Mobile hamburger menu (md:hidden). Labels per spec: Etusivu / Tuotteet / Tarinamme. */
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileLinks = [
    { href: "/",         label: { fi: "Etusivu",   en: "Home"      } },
    { href: "/tuotteet", label: { fi: "Tuotteet",  en: "Products"  } },
    { href: "/tarina",   label: { fi: "Tarinamme", en: "Our story" } },
  ];
  // Close the menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div
      className={["relative z-30", scrolled ? "border-b border-[rgba(26,24,20,0.07)]" : ""].join(" ")}
      style={{
        backdropFilter: scrolled ? "blur(40px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(40px) saturate(1.6)" : "none",
        backgroundColor: scrolled ? "rgba(247, 242, 234, 0.55)" : "transparent",
        boxShadow: scrolled
          ? "inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 36px rgba(26,24,20,0.07)"
          : "none",
        transition:
          "background-color 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s cubic-bezier(0.22,1,0.36,1), backdrop-filter 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group" aria-label="LEIMU etusivu">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Image
              src="/images/logo.png"
              alt="LEIMU"
              width={90}
              height={36}
              className="h-[54px] w-auto object-contain transition-opacity duration-300 group-hover:opacity-85"
              priority
            />
          </motion.div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-10" role="navigation">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-mono text-[13px] tracking-[0.12em] uppercase group outline-none"
              >
                <motion.span
                  className={[
                    "transition-colors duration-200",
                    isActive ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
                  ].join(" ")}
                  whileHover={{ color: "var(--ink)" }}
                  transition={{ duration: 0.15 }}
                >
                  {link.label[lang]}
                </motion.span>

                {/* Animated underline */}
                <AnimatePresence>
                  {isActive ? (
                    <motion.span
                      key="active"
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-[var(--ink)]"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "left" }}
                    />
                  ) : (
                    <motion.span
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-[var(--ink-mute)]"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1, opacity: 0.4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Right: lang toggle + CTAs */}
        <div className="flex items-center gap-5">
          {/* Language toggle */}
          <motion.button
            onClick={toggleLang}
            className="font-mono text-[13px] tracking-[0.1em] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label={`Vaihda kieli — ${lang === "fi" ? "EN" : "FI"}`}
          >
            <span className={lang === "fi" ? "text-[var(--ink)]" : ""}>FI</span>
            <span className="mx-1.5 opacity-40">/</span>
            <span className={lang === "en" ? "text-[var(--ink)]" : ""}>EN</span>
          </motion.button>

          {/* Contact CTA — magnetic liquid glow */}
          <div className="hidden md:block">
            <ContactCTA variant="navbar" />
          </div>

          {/* Order CTA — filled */}
          <Link href="/tuotteet" passHref legacyBehavior>
            <motion.a
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-[12px] font-mono tracking-[0.14em] uppercase rounded-full bg-[var(--ink)] text-[var(--bg)] overflow-hidden relative"
              style={{ boxShadow: "0 2px 16px rgba(26,24,20,0.14)" }}
              whileHover={{ scale: 1.04, boxShadow: "0 6px 28px rgba(26,24,20,0.22)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              {/* Shimmer on hover */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(212,169,106,0.22) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "-100% 0" }}
                whileHover={{ backgroundPosition: "200% 0" }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />
              <span className="relative z-10 flex items-center gap-1.5">
                {lang === "fi" ? "Tilaa" : "Order"}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              </span>
            </motion.a>
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative -mr-1 flex h-9 w-9 items-center justify-center text-[var(--ink)] md:hidden"
            aria-label={menuOpen ? "Sulje valikko" : "Avaa valikko"}
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

      {/* Mobile dropdown menu — md:hidden */}
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
                    className={[
                      "border-b border-[var(--line)] py-4 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors last:border-0",
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
