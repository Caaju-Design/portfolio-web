import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";

/** Âncoras de preço vindas de positioning.md §5. Preço visível é obrigatório. */
const tiers = [
  {
    name: "Design Advisory",
    cadence: "About one day a week",
    description:
      "Strategic direction, critique of your team's work, mentoring for designers, one working session a week.",
    featured: false,
  },
  {
    name: "Fractional Design Lead",
    cadence: "Two to three days a week",
    description:
      "End-to-end design leadership: roadmap, discovery, design system, managing designers, alignment with product and engineering.",
    featured: true,
  },
  {
    name: "Design Partner",
    cadence: "Ongoing · team included",
    description:
      "I lead and assemble the team — designers and research. Strategy and execution delivered together.",
    featured: false,
  },
];

export function Services() {
  return (
    <Section id="services">
      <SectionHeader
        eyebrow="How we work together"
        title="Three ways to bring me in"
        description="Fixed-scope entry points available too: a three-week Discovery Sprint and a two-week Design System Audit."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            interactive
            className={t.featured ? "surface-glow border-primary/40" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-h3">{t.name}</h3>
              {t.featured && <Badge tone="primary">Most common</Badge>}
            </div>
            <p className="mt-6 font-display text-lg text-primary">{t.cadence}</p>
            <p className="mt-5 text-sm leading-relaxed text-muted text-pretty">{t.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button href="/services" variant="secondary">
          Compare engagements
        </Button>
        <p className="text-sm text-muted">
          Monthly contract · 30-day notice · no-penalty exit in the first two weeks.
        </p>
      </div>
    </Section>
  );
}
