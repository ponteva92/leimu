import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "accent-3": "var(--accent-3)",
        "accent-2-strong": "var(--accent-2-strong)",
        "field-border": "var(--field-border)",
        destructive: "var(--destructive)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        // Sizes match Tailwind defaults (zero reflow); line-height + tracking encode the hierarchy.
        xs:    ["0.75rem",  { lineHeight: "1.6" }],
        sm:    ["0.875rem", { lineHeight: "1.6" }],
        base:  ["1rem",     { lineHeight: "1.6" }],
        lg:    ["1.125rem", { lineHeight: "1.6" }],
        xl:    ["1.25rem",  { lineHeight: "1.6",  letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem",   { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "1.2",  letterSpacing: "-0.015em" }],
        "4xl": ["2.25rem",  { lineHeight: "1.2",  letterSpacing: "-0.02em" }],
        "5xl": ["3rem",     { lineHeight: "1.2",  letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem",  { lineHeight: "1.2",  letterSpacing: "-0.022em" }],
        "7xl": ["4.5rem",   { lineHeight: "1.2",  letterSpacing: "-0.025em" }],
        label: ["0.6875rem",{ lineHeight: "1",    letterSpacing: "0.16em" }],
      },
      spacing: {
        "section-lg": "120px",
        "section-md": "80px",
        "section-base": "60px",
        gutter: "24px",
      },
      maxWidth: {
        content: "1200px",
        "7xl": "75rem", /* 1200px — every existing max-w-7xl now conforms, no component edits */
      },
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      boxShadow: {
        e1: "var(--shadow-e1)",
        e2: "var(--shadow-e2)",
        e3: "var(--shadow-e3)",
        e4: "var(--shadow-e4)",
        glow: "var(--shadow-glow)",
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        "float-up": "floatUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "scale-up": "scaleUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floatUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.94)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        premium: "cubic-bezier(0.23, 1, 0.32, 1)", /* strong ease-out (Emil) */
      },
    },
  },
  plugins: [],
};

export default config;
