/**
 * Configuração canônica do site.
 * O domínio NUNCA é hardcoded fora daqui — permite trocar caaju.com.br
 * por outro domínio sem refatoração. Ver security-architecture.md §2.
 */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://caaju.com.br",
  name: "Emanuel Ágape",
  legalEntity: "Caáju Design Ltda",
  role: "Fractional Product Design Lead",
  title: "Emanuel Ágape — Fractional Product Design Lead",
  description:
    "Product leadership for teams that outgrew their design. Senior product direction, design systems and AI-assisted workflows for B2B SaaS teams.",
  locale: "en",
  location: { city: "Rio de Janeiro", country: "Brazil", timezone: "UTC−3" },
  overlap: "6 hours of overlap with New York, 5 with London",
  email: "emanuel@caaju.com.br",
  social: {
    linkedin: "https://www.linkedin.com/in/emanuel-agape/",
    github: "https://github.com/",
  },
  availability: "2 slots open for Q4 2026",
} as const;

export const nav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/writing" },
] as const;

export const footerNav = [
  { label: "How we work", href: "/how-we-work" },
  { label: "References", href: "/testimonials" },
  { label: "Privacy", href: "/legal/privacy" },
] as const;
