import Image from "next/image";

/* The LEIMU mark beside a page's eyebrow. It holds still, so the wax seal
   keeps the site's only gold shimmer. The warm glow behind it is a gradient
   fitted to the old blur(10px) glow at 44px, so no filter runs; the fit holds
   only at this size. */
const GLOW =
  "radial-gradient(closest-side, rgba(212,169,106,0.089) 0%, rgba(212,169,106,0.086) 10%, rgba(212,169,106,0.077) 20%, rgba(212,169,106,0.063) 30%, rgba(212,169,106,0.049) 40%, rgba(212,169,106,0.034) 50%, rgba(212,169,106,0.022) 60%, rgba(212,169,106,0.0135) 70%, rgba(212,169,106,0.007) 80%, rgba(212,169,106,0.0035) 90%, transparent)";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-11 w-11 shrink-0 select-none ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3.5 rounded-full"
        style={{ background: GLOW }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full border border-[rgba(212,169,106,0.18)]"
      />
      <Image
        src="/images/logo-transparent.png"
        alt="LEIMU Candles"
        fill
        priority
        sizes="44px"
        className="object-contain"
      />
    </div>
  );
}
