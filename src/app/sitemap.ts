import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://leimucandles.fi";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tuotteet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tarina`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
