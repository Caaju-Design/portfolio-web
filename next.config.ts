import type { NextConfig } from "next";

/** Headers de segurança globais — ver security-architecture.md §10 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Trava a raiz do file tracing neste diretório.
   * Sem isso o Next sobe a árvore procurando lockfile e pode eleger
   * o home do usuário como raiz do workspace — build lento e trace errado.
   */
  outputFileTracingRoot: import.meta.dirname,
  /** firebase-admin usa binários e APIs de Node — não deve ser empacotado. */
  serverExternalPackages: ["firebase-admin"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Rotas restritas nunca são indexadas nem cacheadas
      {
        source: "/work/:slug/deep",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, noarchive, nosnippet, noimageindex" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/client/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
