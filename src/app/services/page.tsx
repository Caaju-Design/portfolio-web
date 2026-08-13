import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { tiers } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Ways to bring in a fractional product design lead — ongoing engagements and fixed-scope Discovery Sprints and Design System Audits.",
  alternates: { canonical: "/services" },
};

const faqs = [
  {
    q: "How do you price?",
    a: "Monthly for ongoing engagements, fixed for the sprints. I'd rather quote after understanding what you actually need than anchor you to a number that fits someone else's problem. You'll have it in writing within a day of the call.",
  },
  {
    q: "How many clients do you take at once?",
    a: "Two, occasionally three. Fractional only works if the fraction is real — a lead spread across six companies is a lead in name only.",
  },
  {
    q: "What if it isn't working?",
    a: "Monthly contract, 30 days' notice, and a no-penalty exit in the first two weeks. You shouldn't need a lawyer to stop working with me.",
  },
  {
    q: "Do you work with my timezone?",
    a: "Rio de Janeiro, UTC−3. Six hours of real overlap with New York, five with London. Not a handover window — actual shared working hours.",
  },
  {
    q: "Can you do execution as well as strategy?",
    a: "Yes. I still open Figma. But if you only need production design, the Design Partner tier is a better fit than paying lead rates for pixels.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ServicesPage() {
  const retainers = tiers.filter((t) => t.kind === "retainer");
  const projects = tiers.filter((t) => t.kind === "project");

  return (
    <>
      <Section spacing="loose">
        <SectionHeader
          eyebrow="Engagements"
          title="Three ways to bring me in"
          description="Three ongoing engagements and two fixed-scope entry points. Scope and investment are agreed on the call, once I understand what you actually need."
        />
      </Section>

      <Section spacing="tight">
        <div className="grid gap-6 lg:grid-cols-3">
          {retainers.map((tier) => (
            <Card
              key={tier.slug}
              className={
                tier.featured ? "surface-glow flex flex-col border-primary/40" : "flex flex-col"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-h3">{tier.name}</h2>
                {tier.featured && <Badge tone="primary">Most common</Badge>}
              </div>

              <p className="mt-6 font-display text-xl text-primary">{tier.cadence}</p>

              <p className="mt-6 text-sm leading-relaxed text-muted text-pretty">{tier.summary}</p>

              <p className="mt-6 border-l-2 border-primary/40 pl-4 text-sm text-text/90">
                {tier.bestFor}
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-muted">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>

              <Button
                href="/call"
                variant={tier.featured ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                Book a call
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Fixed scope"
          title="Prefer to start small?"
          description="A defined piece of work with a defined outcome. Most ongoing engagements start here."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((tier) => (
            <Card key={tier.slug} interactive>
              <h2 className="text-h3">{tier.name}</h2>
              <p className="mt-1 text-sm text-primary">{tier.cadence}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted text-pretty">{tier.summary}</p>
              <ul className="mt-6 space-y-2">
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-muted">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <SectionHeader eyebrow="Questions" title="Before you book" />
        <dl className="mt-12 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <div key={f.q} className="grid gap-3 py-7 md:grid-cols-[1fr_2fr] md:gap-10">
              <dt className="text-lead text-text">{f.q}</dt>
              <dd className="leading-relaxed text-muted text-pretty">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
