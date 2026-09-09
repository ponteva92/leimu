import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sivua ei löytynyt",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(196,122,58,0.10), transparent 70%)",
        }}
      />
      <div className="relative max-w-md">
        <p className="tag-mono mb-4">404</p>
        <h1 className="heading-display mb-5 text-4xl text-[var(--ink)] md:text-5xl">
          Tätä sivua ei löytynyt.
        </h1>
        <p className="mb-10 leading-relaxed text-[var(--ink-soft)]">
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
