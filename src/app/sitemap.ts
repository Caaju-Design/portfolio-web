import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Apenas rotas públicas. Conteúdo `gated`/`private` nunca entra aqui.
 * Quando os cases migrarem para o Firestore, filtrar por visibility === 'public'.
 */
const routes = [
  { path: "", priority: 1.0 },
  { path: "/work", priority: 0.9 },
  { path: "/services", priority: 0.9 },
  { path: "/how-we-work", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/writing", priority: 0.7 },
  { path: "/testimonials", priority: 0.6 },
  { path: "/call", priority: 0.8 },
  { path: "/legal/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));
}
