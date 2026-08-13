import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Emanuel Ágape — nine years in product design, from Angra dos Reis to enterprise retail and B2B SaaS. Product leadership, design systems and AI-assisted workflows.",
  alternates: { canonical: "/about" },
};

/** Princípios de produto. Vieram do bloco "Filosofia" do briefing original. */
const principles = [
  {
    title: "Data before opinion",
    body: "The loudest voice in the room isn't a research method. If we can't point at evidence, we're guessing — and guessing is expensive at engineering rates.",
  },
  {
    title: "Systems before screens",
    body: "A beautiful screen solves one problem once. A system solves it every time, including after I'm gone. That's the difference between a project and an asset.",
  },
  {
    title: "AI as an amplifier, not a gimmick",
    body: "I use AI to move faster through discovery, documentation and prototyping. Not to put a chat box on a product that didn't need one.",
  },
  {
    title: "Scale from the first flow",
    body: "Most rework comes from decisions made when nobody was thinking about the tenth use case. Cheap to consider early, brutal to retrofit.",
  },
  {
    title: "Product is business, not interface",
    body: "If a design decision can't be connected to something the business cares about, it's decoration. Decoration is fine — just not at this price.",
  },
];

const timeline = [
  {
    period: "Origin",
    title: "Angra dos Reis",
    body: "I didn't start in a design studio in São Paulo. I started far from the centre of things, which turned out to be useful practice for working remotely with teams on another continent.",
  },
  {
    period: "Foundations",
    title: "Marketing, then data",
    body: "I came to product through marketing and then through data science — which is why I tend to ask what a change will move before asking what it should look like.",
  },
  {
    period: "Craft",
    title: "UX and product",
    body: "Years of hands-on work across fintech, e-commerce, healthcare, legal tech and retail. Enough different domains to know that the pattern is never quite the same twice.",
  },
  {
    period: "Scale",
    title: "Enterprise and B2B SaaS",
    body: "Product design for Carrefour Brasil, EHS and risk management platforms, corporate SaaS and enterprise design systems. Complex domains, real constraints, actual users.",
  },
  {
    period: "Now",
    title: "Leadership",
    body: "Leading design functions rather than just producing design. Two designers who reported to me have said so publicly, which matters more than me saying it.",
  },
];

const education = [
  ["MBA", "Data Science & Artificial Intelligence"],
  ["Undergraduate", "Data Science — FIAP"],
  ["Undergraduate", "Marketing"],
  ["Language", "English immersion — South Africa"],
];

export default function AboutPage() {
  return (
    <>
      <Section spacing="loose">
        <SectionHeader
          eyebrow="About"
          title="Nine years turning complex problems into products people actually use"
          description="I'm Emanuel Ágape. I lead design for teams building things that are genuinely difficult — regulated domains, enterprise scale, systems that have to survive their creator."
        />
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/call">Book a call</Button>
          <Button href="/testimonials" variant="secondary">
            Read the references
          </Button>
        </div>
      </Section>

      <Section spacing="tight" className="border-y border-border bg-surface/30">
        <ol className="space-y-12">
          {timeline.map((item) => (
            <li key={item.period} className="grid gap-4 md:grid-cols-[10rem_1fr] md:gap-12">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                {item.period}
              </p>
              <div className="max-w-2xl">
                <h2 className="text-h3">{item.title}</h2>
                <p className="mt-3 leading-relaxed text-muted text-pretty">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="How I think about product"
          title="Five principles I actually apply"
          description="Not a manifesto. These are the arguments I end up making in real meetings."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-(--radius-card) border border-border bg-border md:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="bg-surface p-8">
              <h3 className="text-h3">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Education
            </h2>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {education.map(([label, value]) => (
                <div key={value} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-xs text-subtle">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Where I work from
            </h2>
            <p className="mt-6 leading-relaxed text-muted text-pretty">
              {site.location.city}, {site.location.country} — {site.location.timezone}.
              That means {site.overlap}. Not a handover window at the edge of the day:
              actual shared working hours, when decisions get made.
            </p>
            <p className="mt-4 leading-relaxed text-muted text-pretty">
              I work remotely with teams across the US and Europe, and invoice in USD
              through {site.legalEntity}.
            </p>
            <Button href="/how-we-work" variant="secondary" className="mt-8">
              How engagements work
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
