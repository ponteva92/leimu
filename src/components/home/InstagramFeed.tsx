"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";

const STILLS = [
  { src: "/images/process-5.jpg", fi: "LEIMU-kynttilät studiossa", en: "LEIMU candles in the studio" },
  { src: "/images/Setti.jpg", fi: "Kynttilä ja viimeistelty lahjapakkaus", en: "A candle and its gift packaging" },
  { src: "/images/proc-pour.jpg", fi: "Kynttilän käsinvalaminen", en: "Pouring a candle by hand" },
];

export function InstagramFeed() {
  const lang = useStore((state) => state.lang);
  const sectionRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [minimumHeight, setMinimumHeight] = useState<number>();

  useEffect(() => {
    const section = sectionRef.current;
    const container = feedRef.current;
    if (!section || !container) return;
    let cancelled = false;
    let timeout = 0;
    let widget: HTMLElement | null = null;
    const ready = () => {
      if (cancelled) return;
      setMinimumHeight(section.querySelector<HTMLElement>(".studio-fallback")?.offsetHeight);
      setLoaded(true);
      window.clearTimeout(timeout);
    };
    const failed = () => { window.clearTimeout(timeout); container.replaceChildren(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let script = document.querySelector<HTMLScriptElement>("script[data-behold]");
      if (!script) {
        script = document.createElement("script");
        script.type = "module";
        script.src = "https://w.behold.so/widget.js";
        script.dataset.behold = "1";
        document.head.appendChild(script);
      }
      widget = document.createElement("behold-widget");
      widget.setAttribute("feed-id", "Z0vXK9Le7HnNNay5tri8");
      // The official wrapper uses this event; the widget's shadow root is closed.
      // https://github.com/BeholdSocial/behold-react/blob/main/src/index.tsx
      widget.addEventListener("load", ready, { once: true });
      widget.addEventListener("error", failed, { once: true });
      container.replaceChildren(widget);
      timeout = window.setTimeout(() => { if (!cancelled) failed(); }, 10000);
    }, { rootMargin: "350px" });
    observer.observe(section);
    return () => { cancelled = true; observer.disconnect(); window.clearTimeout(timeout); widget?.removeEventListener("load", ready); widget?.removeEventListener("error", failed); container.replaceChildren(); };
  }, []);

  return (
    <section ref={sectionRef} className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="tag-mono mb-4">{lang === "fi" ? "Studion tunnelmia" : "From the studio"}</p>
          <h2 className="heading-display text-4xl md:text-5xl">{lang === "fi" ? <>Lähempänä <em>LEIMUa.</em></> : <>A little closer to <em>LEIMU.</em></>}</h2>
        </div>
        <a href="https://www.instagram.com/leimucandles/" target="_blank" rel="noopener noreferrer" className="text-link">@leimucandles<ArrowRight size={15} aria-hidden="true" /></a>
      </div>
      <div className="relative" style={{ minHeight: minimumHeight }}>
      <div ref={feedRef} className={loaded ? "min-h-[320px]" : "pointer-events-none absolute inset-x-0 top-0 opacity-0"} aria-hidden={!loaded} />
      {!loaded && <div className="studio-fallback">{STILLS.map((still, index) => (
        <figure key={still.src}><Image src={still.src} alt={still[lang]} fill sizes={index === 0 ? "(max-width: 767px) 90vw, 450px" : "(max-width: 767px) 43vw, 320px"} /></figure>
      ))}</div>}
      </div>
    </section>
  );
}
