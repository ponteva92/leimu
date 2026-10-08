/* ════════════════════════════════════════════════════════════════════════
   LEIMU — How a candle is made
   ------------------------------------------------------------------------
   The six steps, shared by the story page (all six, as a timeline) and the
   home page's craft film (the four in CRAFT_BEATS).
   ════════════════════════════════════════════════════════════════════════ */

export type ProcessStep = {
  num: string;
  title: { fi: string; en: string };
  desc: { fi: string; en: string };
  data: { fi: string; en: string };
  img: string;
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    num: "01",
    title: { fi: "Raaka-aineiden valinta", en: "Raw material sourcing" },
    desc: {
      fi: "Soijavaha valitaan luotetulta toimittajalta, 100% luonnollinen, ei lisäaineita. Sheabutter ja aromiöljyt seulotaan tarkasti.",
      en: "Soy wax sourced from trusted suppliers, 100% natural, no additives. Shea butter and fragrance oils carefully vetted.",
    },
    data: {
      fi: "Soijavaha 100% · Sheabutter 10% · Puuvillasydän",
      en: "Soy wax 100% · Shea butter 10% · Cotton wick",
    },
    img: "/images/proc-materials.avif",
  },
  {
    num: "02",
    title: { fi: "Vahan sulatus", en: "Wax melting" },
    desc: {
      fi: "Vaha sulatetaan tarkalleen 75–80°C:ssa. Liian kuuma polttaa tuoksun, liian kylmä ei sido sitä, keskellä on totuus.",
      en: "Wax melted to exactly 75–80°C. Too hot burns the scent, too cold won't bind it, the truth lives in between.",
    },
    data: {
      fi: "Lämpötila: 75–80°C · Kesto: 30–40 min",
      en: "Temp: 75–80°C · Duration: 30–40 min",
    },
    img: "/images/pour-process.jpg",
  },
  {
    num: "03",
    title: { fi: "Tuoksuöljyn lisäys", en: "Fragrance addition" },
    desc: {
      fi: "Sheabutterin ja aromien suhde mitoitetaan jokaiselle erälle erikseen. Tämä antaa LEIMUlle samettisen, kermaisen rakenteen.",
      en: "Fragrance and shea butter ratio calibrated per batch. This gives LEIMU its signature velvety, creamy texture.",
    },
    data: {
      fi: "Tuoksuöljyä: 8–10% · Sekoitus: 15 min · käsin",
      en: "Fragrance load: 8–10% · Mix time: 15 min · by hand",
    },
    img: "/images/proc-scent.png",
  },
  {
    num: "04",
    title: { fi: "Kaataminen", en: "Pouring" },
    desc: {
      fi: "Yksi kynttilä kerrallaan. Puuvillasydän asetetaan keskelle, vaha kaadetaan tasaisella liikkeellä, ei kuplia, ei pintaviivoja.",
      en: "One candle at a time. Wick centered, wax poured in one smooth motion, no bubbles, no surface lines.",
    },
    data: {
      fi: "Kaatolämpötila: 55°C · ~5 min / kynttilä",
      en: "Pour temp: 55°C · ~5 min per candle",
    },
    img: "/images/proc-pour.jpg",
  },
  {
    num: "05",
    title: { fi: "Cure-vaihe", en: "Curing" },
    desc: {
      fi: "Kynttilät saavat rauhassa kypsyä viikon. Tuoksu vahvistuu, vaha asettuu, lopullinen luonne löytyy.",
      en: "Candles cure undisturbed for a week. Scent deepens, wax settles, final character emerges.",
    },
    data: {
      fi: "Kypsytys: 7 päivää · 20°C · pimeässä",
      en: "Cure time: 7 days · 20°C · in the dark",
    },
    img: "/images/proc-cure.png",
  },
  {
    num: "06",
    title: { fi: "Viimeistely ja pakkaus", en: "Finishing & packaging" },
    desc: {
      fi: "Käsinkirjoitettu kiitoskortti, kultasinetti, sinetöity kuori. Bambukansi asetetaan, tarra kiinnitetään käsin, juuri sinulle.",
      en: "Handwritten thank-you card, gold wax seal, sealed envelope. Bamboo lid placed, label applied by hand, made just for you.",
    },
    data: {
      fi: "Bambukansi · Käsin kiinnitetty tarra · Kultainen vahasinetti · Laaduntarkastus",
      en: "Bamboo lid · Hand-applied label · Gold wax seal · QC check",
    },
    img: "/images/Setti.jpg",
  },
];

/* The home film tells the story in four beats: what goes in, the pour,
   the week of patience, and the hand-finished parcel. */
export const CRAFT_BEATS: ProcessStep[] = [0, 3, 4, 5].map((i) => PROCESS_STEPS[i]);
