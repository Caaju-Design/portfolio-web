/**
 * O sistema operacional da Caáju.
 *
 * Fonte única da constelação em /lab: posição, estado, domínio e destino de
 * cada nó saem daqui, nunca do componente.
 *
 * O QUE ESTE MAPA ARGUMENTA
 * Não é uma lista de ferramentas — é uma empresa modelada por função. Dinheiro,
 * informação, ofício, receita, gente e confiança são domínios que toda empresa
 * tem; aqui cada um virou um sistema com nome próprio. A tese fica visível no
 * arranjo antes de ser lida no texto.
 *
 * REGRA DE HONESTIDADE: `status` não é enfeite. Quatro dos seis ainda não
 * existem, e dizer isso é o que separa roadmap de vaporware — justamente para
 * o leitor que sabe distinguir os dois, que é quem a gente quer impressionar.
 * Produto sem `url` vira nó sem link, jamais link morto.
 */

export type ProductStatus = "live" | "building" | "planned";

export type Product = {
  slug: string;
  name: string;
  /** A função que ele ocupa na empresa. Uma palavra. */
  domain: string;
  /** Uma linha. Se não couber em uma, o produto ainda não está claro. */
  summary: string;
  /** O que muda na operação por ele existir. */
  role: string;
  status: ProductStatus;
  /** Tela de entrada. Ausente = nó sem link. */
  url?: string;
  /** Posição no mapa, em % da área. O núcleo fica em 50/50. */
  position: { x: number; y: number };
};

export const statusLabel: Record<ProductStatus, string> = {
  live: "In production",
  building: "In progress",
  planned: "Planned",
};

export const products: Product[] = [
  {
    slug: "portinari",
    name: "Portinari",
    domain: "Craft",
    summary: "Tactical orchestration for design work.",
    role: "Where the studio's work is planned, sequenced and shipped.",
    status: "live",
    url: "https://portinari.caaju.com.br/auth",
    position: { x: 22, y: 31 },
  },
  {
    slug: "bonner",
    name: "Bonner",
    domain: "Signal",
    summary: "The newsroom — a daily briefing, written overnight.",
    role: "Reads the field so the morning starts informed instead of catching up.",
    status: "live",
    // Roda em produção todo dia útil, mas entrega por e-mail e Slack: a tela
    // própria está no roadmap. `status` fala do produto, `url` fala da porta.
    position: { x: 78, y: 31 },
  },
  {
    slug: "juca",
    name: "Juca",
    domain: "Money",
    summary: "The ledger — cash flow and financial control.",
    role: "Turns invoices, costs and runway into one number worth trusting.",
    status: "building",
    position: { x: 82, y: 66 },
  },
  {
    slug: "botini",
    name: "Botini",
    domain: "Revenue",
    summary: "Sales and marketing, from first signal to signed.",
    role: "Connects who showed interest to what actually closed.",
    status: "planned",
    position: { x: 50, y: 85 },
  },
  {
    slug: "ju",
    name: "Ju",
    domain: "People",
    summary: "The team — contracts, onboarding, and how the work feels.",
    role: "Treats morale as something to measure, not to assume.",
    status: "planned",
    position: { x: 18, y: 66 },
  },
  {
    slug: "malik",
    name: "Malik",
    domain: "Trust",
    summary: "Security, uptime and the audit nobody asks for.",
    role: "Watches the other five so a client never has to ask whether it is safe.",
    status: "planned",
    position: { x: 50, y: 14 },
  },
];

/** O centro do mapa. Não é produto — é o que os produtos servem. */
export const core = {
  name: "Caáju",
  summary: "The studio these systems exist to run.",
  position: { x: 50, y: 50 },
} as const;
