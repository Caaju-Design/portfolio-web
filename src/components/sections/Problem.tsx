import { Section, SectionHeader } from "@/components/ui/Section";

const symptoms = [
  "Your team ships fast, but the product feels stitched together.",
  "Designers are executing tickets with nobody setting direction.",
  "Every squad rebuilds the same component a slightly different way.",
  "Roadmap decisions are made on opinion because nobody ran discovery.",
  "You've been trying to hire a Head of Design for six months.",
];

export function Problem() {
  return (
    <Section>
      <SectionHeader
        eyebrow="The situation"
        title="Growth outpaced your design function"
        description="These are the symptoms teams describe right before they call me."
      />
      <ul className="mt-12 grid gap-px overflow-hidden rounded-(--radius-card) border border-border bg-border">
        {symptoms.map((s) => (
          <li key={s} className="bg-surface px-6 py-5 text-lead text-muted md:px-8">
            {s}
          </li>
        ))}
      </ul>
    </Section>
  );
}
