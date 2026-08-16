import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on product leadership, design systems, product discovery and applying AI to product work.",
  alternates: { canonical: "/writing" },
};

/**
 * Fila editorial. Cada artigo abre com uma resposta direta e autocontida
 * (o campo `answerBlock` do content-model) — é esse trecho que um LLM cita.
 * GEO é o canal primário de aquisição; ver positioning.md §8.
 */
const planned = [
  {
    topic: "Design systems",
    title: "The Tailwind 4 token namespace trap",
    teaser:
      "Declaring a semantic spacing scale silently rewired every max-width utility in the app. No error, no warning, build green.",
  },
  {
    topic: "Design leadership",
    title: "What a fractional design lead actually does",
    teaser:
      "Two days a week is not a smaller version of five. It changes what you should be doing with the time.",
  },
  {
    topic: "Product discovery",
    title: "Proof when you have no metrics",
    teaser:
      "Most portfolios invent percentages. Scope, longevity and repeat clients are harder to fake and easier to defend.",
  },
  {
    topic: "AI for product",
    title: "Protecting client work from autonomous agents",
    teaser:
      "What actually stops a crawler, what only looks like it does, and the honest limits of any of it.",
  },
];

export default function WritingPage() {
  return (
    <>
      <Section spacing="loose">
        <SectionHeader
        as="h1"
          eyebrow="Writing"
          title="Notes from the work"
          description="Things I've had to figure out on real projects — design systems, product discovery, leading design teams, and using AI without the theatre."
        />
      </Section>

      <Section spacing="tight">
        <div className="grid gap-6 md:grid-cols-2">
          {planned.map((item) => (
            <Card key={item.title} className="flex flex-col">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                {item.topic}
              </p>
              <h2 className="mt-4 text-h3 text-balance">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted text-pretty">
                {item.teaser}
              </p>
              <p className="mt-6 text-xs text-subtle">Coming soon</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-(--radius-card) border border-border bg-surface px-6 py-12 text-center md:px-16">
          <h2 className="text-h3">Rather talk than read?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted text-pretty">
            Most of what would end up here I&apos;m happy to go through directly.
          </p>
          <Button href="/call" className="mt-8">
            Book a call
          </Button>
        </div>
      </Section>
    </>
  );
}
