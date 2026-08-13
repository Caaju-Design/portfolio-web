import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we work",
  description:
    "Contracts, invoicing in USD, NDAs, IP ownership and timezone overlap — everything procurement needs before approving an engagement.",
  alternates: { canonical: "/how-we-work" },
};

/**
 * Página de redução de atrito. Não é burocracia — é o que faz procurement
 * internacional aprovar sem medo. Ver docs/positioning.md §7.
 */
const blocks = [
  {
    title: "Contract",
    items: [
      ["Structure", "Master Services Agreement plus a Statement of Work per engagement"],
      ["Term", "Monthly, rolling. 30 days' notice to end it"],
      ["Trial", "No-penalty exit in the first two weeks of a retainer"],
      ["Paperwork", "I'll sign your template, or provide mine"],
    ],
  },
  {
    title: "Money",
    items: [
      ["Currency", "USD, invoiced monthly in advance"],
      ["Invoiced by", "Caáju Design Ltda, a registered Brazilian company"],
      ["Payment", "Wise, Payoneer, Deel or international wire"],
      ["Terms", "Net 15"],
      ["US clients", "W-8BEN-E provided on request"],
    ],
  },
  {
    title: "Confidentiality and IP",
    items: [
      ["NDA", "Mutual NDA available, or I'll sign yours"],
      ["Ownership", "All work product transfers to you on final payment"],
      ["Portfolio", "Nothing is published without your written approval"],
      [
        "Restricted material",
        "Case studies under NDA sit behind a named link with a full access log — I can hand you that log at any time",
      ],
    ],
  },
  {
    title: "Working together",
    items: [
      ["Base", `${site.location.city}, ${site.location.country} (${site.location.timezone})`],
      ["Overlap", site.overlap],
      ["Tools", "Figma, Slack, Linear or Jira, Notion — I adapt to your stack"],
      ["Rhythm", "Weekly working sessions, async by default in between"],
      ["Reporting", "Baseline captured at kickoff, measured again at 90 days"],
    ],
  },
];

export default function HowWeWorkPage() {
  return (
    <>
      <Section spacing="loose">
        <SectionHeader
          eyebrow="The boring, important part"
          title="How engagements actually work"
          description="Most of the friction in hiring someone abroad isn't the work — it's the paperwork. Here it is upfront, so nobody has to ask."
        />
      </Section>

      <Section spacing="tight">
        <div className="space-y-16">
          {blocks.map((block) => (
            <section key={block.title}>
              <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                {block.title}
              </h2>
              <dl className="mt-6 divide-y divide-border border-y border-border">
                {block.items.map(([label, value]) => (
                  <div key={label} className="grid gap-2 py-5 md:grid-cols-[1fr_2fr] md:gap-10">
                    <dt className="text-sm text-subtle">{label}</dt>
                    <dd className="text-sm leading-relaxed text-pretty">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="rounded-(--radius-card) border border-primary/25 bg-surface px-6 py-14 text-center md:px-16">
          <h2 className="mx-auto max-w-2xl text-h2 text-balance">
            Anything here you&apos;d need changed?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted">
            Tell me on the call. None of it is set in stone — it&apos;s written down so we
            don&apos;t waste three emails discovering we agree.
          </p>
          <Button href="/call" size="lg" className="mt-9">
            Book a call
          </Button>
        </div>
      </Section>
    </>
  );
}
