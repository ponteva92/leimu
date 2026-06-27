import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sivua ei löytynyt",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-gutter text-center">
      <div className="max-w-md">
        <p className="tag-mono mb-3">404</p>
        <h1 className="heading-display mb-5 text-4xl text-[var(--ink)] md:text-5xl">
          Tätä sivua ei löytynyt.
        </h1>
        <p className="mb-8 leading-relaxed text-[var(--ink-soft)]">
          Sivu on voitu siirtää tai poistaa. Tarkista osoite tai palaa etusivulle.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--bg)] transition-colors duration-base hover:bg-[var(--accent-2)]"
        >
          Takaisin etusivulle
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
