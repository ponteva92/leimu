"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  animate, motion, useInView, useReducedMotion,
  useScroll, useTransform, type MotionValue,
} from "framer-motion";
import { ArrowRight, Drop, Fire, Leaf, Plant } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { ScentModal } from "@/components/ScentModal";
import { DrawnRule } from "@/components/DrawnRule";
import {
  EASE_PREMIUM, headingReveal, headingCinematic, fadeUpItem,
  staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { HeroCandle } from "@/components/hero/HeroCandle";
import { GiftCeremony } from "@/components/GiftCeremony";
import { ScentIndex } from "@/components/home/ScentIndex";
import { QuoteWall } from "@/components/home/QuoteWall";

/* ─── Craft Ledger ──────────────────────────────────
   Three true numerals on one hairline band, tabular mono. The old fourth
   "stat" (one batch at a time) was words posing as a number; that fact
   lives in the story copy below. Numerals count up once as the band
   enters — a ledger being tallied, not a dashboard being scrubbed. */
function LedgerNumeral({ prefix = "", value, suffix = "" }: {
  prefix?: string; value: number; suffix?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_PREMIUM,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <p ref={ref} className="font-mono text-2xl md:text-3xl tracking-tight tabular-nums text-[var(--ink)]">
      {prefix}{display}{suffix}
    </p>
  );
}

function CraftLedger() {
  const { lang } = useStore();

  const stats = [
    { value: 100, suffix: "%", label: { fi: "Soijavahaa", en: "Soy wax" } },
    { value: 36, prefix: "~", suffix: " h", label: { fi: "Paloaika", en: "Burn time" } },
    { value: 5, label: { fi: "Tuoksua", en: "Scents" } },
  ];

  return (
    <section className="border-y border-[var(--line)] bg-[var(--bg-2)]">
      <motion.div
        className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-12 grid grid-cols-3 gap-6 text-center md:text-left"
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {stats.map((s) => (
          <motion.div key={s.label.fi} variants={fadeUpItem} className="flex flex-col gap-1.5">
            <LedgerNumeral prefix={s.prefix} value={s.value} suffix={s.suffix} />
            <p className="tag-mono text-[10px]">{s.label[lang]}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Story Teaser ──────────────────────────────── */
function StoryTeaser() {
  const { lang } = useStore();
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);

  const images = [
    { src: "/images/story-1.jpg", alt: "Kynttilän valmistus", style: y1 },
    { src: "/images/story-2.jpg", alt: "Tuoksuöljyt", style: y2 },
    { src: "/images/story-3.jpg", alt: "Valmiit kynttilät", style: y3 },
  ];

  return (
    <section ref={containerRef} className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Image collage */}
        <div className="relative h-[480px] md:h-[560px]">
          {images.map((img, i) => {
            const positions = [
              "left-0 top-0 w-[58%] h-[52%]",
              "right-0 top-[8%] w-[45%] h-[44%]",
              "left-[18%] bottom-0 w-[52%] h-[44%]",
            ];
            return (
              <motion.div
                key={i}
                className={`absolute rounded-xl overflow-hidden ${positions[i]}`}
                style={{ y: img.style }}
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
                whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={VIEWPORT_NEAR}
                transition={{ duration: 1.2, delay: i * 0.14, ease: EASE_PREMIUM }}
                whileHover={{ scale: 1.03 }}
              >
                {/* Counter-zoom inside the wipe so the photo settles as the mask opens */}
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? undefined : { scale: 1.14 }}
                  whileInView={reduce ? undefined : { scale: 1 }}
                  viewport={VIEWPORT_NEAR}
                  transition={{ duration: 1.5, delay: i * 0.14, ease: EASE_PREMIUM }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 30vw"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Sticky text — staggered reveal */}
        <motion.div
          className="md:sticky md:top-24 flex flex-col gap-6"
          variants={staggerCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          <motion.h2
            variants={headingCinematic}
            className="heading-display text-5xl md:text-6xl text-[var(--ink)]"
          >
            {lang === "fi"
              ? "Pienestä intohimosta syntyi LEIMU."
              : "From a small passion, LEIMU was born."}
          </motion.h2>
          <motion.p variants={fadeUpItem} className="text-[var(--ink-soft)] leading-relaxed">
            {lang === "fi"
              ? "LEIMU sai alkunsa kodista ja rakkaudesta käsityöhön. Jokainen purkki täytetään käsin, yksi kerrallaan: soijavahasta ja sheabutterista, suomalaiseen luontoon inspiroituneilla tuoksuilla. Kaikki purkit ovat läpikuultavaa maitolasia (mattalasi)."
              : "LEIMU began at home, from a love of craft. Each jar is filled by hand, one at a time: soy wax and shea butter, inspired by Finnish nature. All jars are translucent frosted milk glass."}
          </motion.p>
          <motion.div variants={fadeUpItem}>
            <Link
              href="/tarina"
              className="inline-flex items-center gap-2 tag-mono text-[11px] text-[var(--accent-2-strong)] hover:text-[var(--ink)] transition-colors mt-2 w-fit group"
            >
              {lang === "fi" ? "Lue koko tarina" : "Read full story"}
              <ArrowRight
                size={13}
                weight="light"
                aria-hidden="true"
                className="transition-transform duration-base group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Instagram Feed (Behold widget, lazy) ────────────────────────
   The third-party script loads only once the section approaches the
   viewport, and the container reserves height so the feed never shifts
   layout. Real photos beat any placeholder grid. */
function InstagramFeed() {
  const { lang } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mount = () => {
      if (!document.querySelector("script[data-behold]")) {
        const s = document.createElement("script");
        s.type = "module";
        s.src = "https://w.behold.so/widget.js";
        s.setAttribute("data-behold", "1");
        document.head.appendChild(s);
      }
      if (!el.querySelector("behold-widget")) {
        const w = document.createElement("behold-widget");
        w.setAttribute("feed-id", "Z0vXK9Le7HnNNay5tri8");
        el.appendChild(w);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          mount();
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <motion.h2
          className="heading-display text-5xl md:text-6xl text-[var(--ink)]"
          variants={headingReveal}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          {lang === "fi" ? "@leimucandles Instagramissa." : "@leimucandles on Instagram."}
        </motion.h2>
        <a
          href="https://www.instagram.com/leimucandles/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 tag-mono text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
        >
          {lang === "fi" ? "Avaa Instagram" : "Open Instagram"}
          <ArrowRight size={13} weight="light" aria-hidden="true" />
        </a>
      </div>
      <div ref={containerRef} className="w-full min-h-[320px]" />
    </section>
  );
}

/* ─── Benefits + Pull Quote ─────────────────────── */
function Benefits() {
  const { lang } = useStore();

  const values = [
    {
      icon: <Plant size={24} weight="light" />,
      title: { fi: "Soijavaha", en: "Soy wax" },
      desc: {
        fi: "100% luonnollinen soijavaha palaa puhtaasti ja pidempään kuin parafiini. Ei nokea, ei kemikaaleja.",
        en: "100% natural soy wax burns cleanly and longer than paraffin. No soot, no chemicals.",
      },
    },
    {
      icon: <Drop size={24} weight="light" />,
      title: { fi: "Sheabutter", en: "Shea butter" },
      desc: {
        fi: "~10% sheabutteria antaa kynttilälle samettisen koostumuksen ja pidentää paloaikaa luonnollisesti.",
        en: "~10% shea butter gives the candle a velvety texture and extends burn time naturally.",
      },
    },
    {
      icon: <Fire size={24} weight="light" />,
      title: { fi: "Puuvillasydän", en: "Cotton wick" },
      desc: {
        fi: "100% puuvillasydän, ei metallia eikä sinkkiä. Puhdas, hiljainen liekki loppuun asti.",
        en: "100% cotton wick, no metal or zinc. Clean, quiet flame all the way through.",
      },
    },
    {
      icon: <Leaf size={24} weight="light" />,
      title: { fi: "Bambukansi", en: "Bamboo lid" },
      desc: {
        fi: "Uusiutuvan bambun kansi: nopeimmin kasvava materiaali maapallolla, täysin biohajoava.",
        en: "Renewable bamboo lid: the fastest-growing material on earth, fully biodegradable.",
      },
    },
  ];

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <motion.h2
        variants={headingCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
        className="heading-display text-5xl md:text-6xl text-[var(--ink)] mb-16"
      >
        {lang === "fi"
          ? "Laatu jokaisessa yksityiskohdassa."
          : "Quality in every detail."}
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-8"
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {values.map((v, i) => (
          <motion.div
            key={i}
            variants={fadeUpItem}
            className="relative pt-8 md:pt-0 md:px-8 first:pt-0 first:pl-0 last:pr-0 flex flex-col gap-4"
          >
            {i > 0 && (
              <>
                <DrawnRule className="absolute top-0 inset-x-0 md:hidden" />
                <DrawnRule vertical className="absolute left-0 top-0 hidden h-full md:block" />
              </>
            )}
            <motion.div
              className="w-12 h-12 rounded-xl border border-[var(--line)] flex items-center justify-center text-[var(--accent-2-strong)]"
              whileHover={{
                scale: 1.08,
                borderColor: "var(--accent-2)",
                backgroundColor: "rgba(196,122,58,0.08)",
              }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              aria-hidden="true"
            >
              {v.icon}
            </motion.div>
            <p className="font-serif text-2xl italic text-[var(--ink)]">{v.title[lang]}</p>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{v.desc[lang]}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Dusk Quote ─────────────────────────────────────────────────
   The page's one dark passage, and it is motivated: real candlelight
   photography, not a flat ink slab. Text sits left; the lit candle
   stays visible on the right. Gentle parallax gives the photo depth. */
function DuskQuote() {
  const { lang } = useStore();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: imgY }}>
        <Image
          src="/images/hero-candle.jpg"
          alt=""
          fill
          className="object-cover object-[68%_center]"
          sizes="100vw"
        />
      </motion.div>
      {/* Warm ink scrim, heavier on the text side for AA contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(20,17,13,0.84) 0%, rgba(20,17,13,0.62) 52%, rgba(20,17,13,0.28) 100%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-36 md:py-48">
        <motion.p
          variants={headingCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
          className="max-w-2xl font-serif italic font-medium text-4xl md:text-6xl leading-[1.15]"
          style={{ color: "#F5EFE4" }}
        >
          {lang === "fi" ? (
            <>
              Kynttilä ei ole vain valo,{" "}
              <span style={{ color: "#D89456" }}>se on hetki.</span>
            </>
          ) : (
            <>
              A candle is not just light.{" "}
              <span style={{ color: "#D89456" }}>It&apos;s a moment.</span>
            </>
          )}
        </motion.p>
      </div>
    </section>
  );
}


/* ─── Page ──────────────────────────────────────────────────────────
   The hero is sticky (z-0); everything below sits in a higher-z, opaque
   shell so it glides up and over the hero as you scroll — the hero dims
   and recedes rather than scrolling away.                                 */
export function HomeClient() {
  return (
    <>
      <ScentModal />
      <HeroCandle />
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)]">
        {/* Premium seam — a warm hairline where the content rises over the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-px inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(26,24,20,0.12) 25%, rgba(196,122,58,0.28) 50%, rgba(26,24,20,0.12) 75%, transparent)" }}
        />
        <CraftLedger />
        <StoryTeaser />
        <ScentIndex />
        <GiftCeremony />
        <QuoteWall />
        <InstagramFeed />
        <Benefits />
        <DuskQuote />
      </div>
    </>
  );
}
