/** Ofertas e âncoras de preço — espelha docs/positioning.md §5. */
export type Tier = {
  slug: string;
  name: string;
  /** Preço fora do site por ora — ver ADR-022. Mantido no tipo para retorno fácil. */
  price?: string;
  cadence: string;
  summary: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
  kind: "retainer" | "project";
};

export const tiers: Tier[] = [
  {
    slug: "advisory",
    name: "Design Advisory",
    cadence: "About one day a week",
    kind: "retainer",
    summary:
      "Senior direction for a team that already ships, but needs someone to set the bar and hold it.",
    bestFor: "You have designers. You don't have a design leader.",
    includes: [
      "Weekly working session with the team",
      "Critique and direction on work in progress",
      "Mentoring for designers",
      "Async availability for decisions",
    ],
  },
  {
    slug: "fractional-lead",
    name: "Fractional Design Lead",
    cadence: "Two to three days a week",
    kind: "retainer",
    featured: true,
    summary:
      "I run the design function end to end — the same job as a Head of Design, without the hire.",
    bestFor: "Design is a bottleneck and the roadmap is waiting on it.",
    includes: [
      "Design strategy tied to the product roadmap",
      "Product discovery and research",
      "Design system: build, govern, or rescue",
      "Managing and growing designers",
      "Alignment with product and engineering leadership",
      "Hiring support when you're ready for a full-time lead",
    ],
  },
  {
    slug: "design-partner",
    name: "Design Partner",
    cadence: "Ongoing · team included",
    kind: "retainer",
    summary:
      "I lead and assemble the team. Strategy and execution delivered together, as one unit.",
    bestFor: "You need output and direction, and you need both now.",
    includes: [
      "Everything in Fractional Design Lead",
      "A design team assembled and managed by me",
      "Research capacity",
      "Single point of accountability for delivery",
    ],
  },
  {
    slug: "discovery-sprint",
    name: "Discovery Sprint",
    cadence: "Fixed scope · three weeks",
    kind: "project",
    summary:
      "Structured discovery before you commit engineering budget to the wrong thing.",
    bestFor: "The roadmap is built on opinion and nobody has talked to users.",
    includes: [
      "Stakeholder and user interviews",
      "UX audit of the current product",
      "Opportunity mapping",
      "Prioritised roadmap with rationale",
      "Findings presented to your leadership",
    ],
  },
  {
    slug: "design-system-audit",
    name: "Design System Audit",
    cadence: "Fixed scope · two weeks",
    kind: "project",
    summary:
      "A diagnosis of what your system actually is, and a plan to make it survive.",
    bestFor: "Every squad rebuilds the same component a slightly different way.",
    includes: [
      "Inventory of components and inconsistencies",
      "Token architecture",
      "Migration plan, sequenced by effort and impact",
      "Governance model so it doesn't rot again",
    ],
  },
];
