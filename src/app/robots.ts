import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Search bots liberados (GEO é o canal primário de aquisição).
 * Training bots bloqueados. Ver positioning.md §8.
 */
export default function robots(): MetadataRoute.Robots {
  const blockedPaths = ["/work/*/deep", "/client/", "/access/", "/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: blockedPaths },
      // Treinamento de modelo — negado
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      // Busca generativa — permitido, exceto rotas restritas
      { userAgent: "OAI-SearchBot", allow: "/", disallow: blockedPaths },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: blockedPaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: blockedPaths },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
