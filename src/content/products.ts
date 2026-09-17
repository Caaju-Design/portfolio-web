/**
 * O ecossistema que roda a Caáju.
 *
 * Fonte única da constelação em /lab. Mexer aqui muda a página inteira —
 * posição, estado e destino dos nós saem daqui, não do componente.
 *
 * REGRA DE HONESTIDADE: `status` não é enfeite. Mostrar como pronto o que
 * ainda não está custa credibilidade justamente com quem sabe ler — e é
 * quem a gente quer impressionar. Produto sem `url` vira nó sem link, nunca
 * link quebrado.
 */

export type ProductStatus = "live" | "building" | "planned";

export type Product = {
  slug: string;
  name: string;
  /** Uma linha. Se não couber em uma, o produto ainda não está claro. */
  summary: string;
  /** O que ele resolve na operação. Aparece abaixo do nome. */
  role: string;
  status: ProductStatus;
  /** Tela de entrada do produto. Ausente = nó sem link. */
  url?: string;
  /** Posição no mapa, em % da área da constelação. O núcleo fica em 50/50. */
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
    // TODO(Manu): confirmar — escrevi pelo nome, não pelo que ele faz.
    summary: "Design and delivery workspace.",
    role: "Where the work gets organised.",
    status: "live",
    url: "https://portinari.caaju.com.br/auth",
    position: { x: 20, y: 28 },
  },
  {
    slug: "bonner",
    name: "Bonner",
    summary: "A daily briefing, assembled and written overnight.",
    role: "Reads ~50 sources, groups and summarises them before the day starts.",
    status: "live",
    // Roda em produção todo dia útil, mas ainda entrega por e-mail e Slack:
    // a tela própria está no roadmap. `status: live` fala do produto e a
    // ausência de `url` fala da porta — são coisas diferentes.
    // TODO(Manu): URL quando a tela existir.
    position: { x: 80, y: 28 },
  },
  {
    slug: "juca",
    name: "Juca",
    summary: "Finance and operations for Caáju.",
    role: "Becoming the system of record for how the company runs.",
    status: "building",
    // TODO(Manu): URL quando a tela de login existir.
    position: { x: 50, y: 84 },
  },
];

/** O centro do mapa. Não é produto — é o que os produtos servem. */
export const core = {
  name: "Caáju",
  summary: "The operation these tools exist to run.",
  position: { x: 50, y: 50 },
} as const;
