"use client";

import { COPY } from "@/lib/copy";
import { CONTACTS } from "@/lib/contacts";
import { PrivacyLink } from "@/components/PrivacyModal";
import { useStore } from "@/context/store";

export function SiteFooter() {
  const { lang } = useStore();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-2)] py-16 px-8 mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif text-2xl italic mb-3 text-[var(--ink)]">LEIMU</p>
          <p className="tag-mono mb-6">{COPY.footer.tag[lang]}</p>
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-xs">
            {COPY.footer.blurb[lang]}
          </p>
        </div>
        <div>
          <p className="tag-mono mb-6">{COPY.footer.nav[lang]}</p>
          <nav className="flex flex-col gap-3">
            {[
              { href: "/", label: COPY.nav.home[lang] },
              { href: "/tuotteet", label: COPY.nav.products[lang] },
              { href: "/tarina", label: COPY.nav.story[lang] },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <PrivacyLink className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors text-left">
              {COPY.footer.privacy[lang]}
            </PrivacyLink>
          </nav>
        </div>
        <div>
          <p className="tag-mono mb-6">{COPY.footer.contact[lang]}</p>
          <a
            href={`mailto:${CONTACTS.email}`}
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent-2)] transition-colors"
          >
            {CONTACTS.email}
          </a>
          <p className="text-sm text-[var(--ink-mute)] mt-2">{CONTACTS.shopPhone}</p>
          <div className="flex items-center gap-4 mt-6">
            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LEIMU Instagram"
              className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={CONTACTS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LEIMU Facebook"
              className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-[var(--ink-mute)] mt-8">
            © {year} LEIMU. {COPY.footer.rights[lang]}
          </p>
        </div>
      </div>
    </footer>
  );
}
