import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SignalGrid } from "@/components/ui/Signal";
import { Wall } from "@/components/sections/Wall";
import { getCase } from "@/lib/cases";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return { title: "Not found" };

  return {
    title: `${item.title} — ${item.headline}`,
    description: item.seoDescription,
    alternates: { canonical: `/work/${slug}` },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  return (
    <>
      <Section spacing="loose">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{item.industry.replace(/-/g, " ")}</Badge>
          <Badge>{item.year}</Badge>
          {item.deepAccess === "gated" && <Badge tone="accent">Client access</Badge>}
        </div>

        <h1 className="mt-6 max-w-4xl text-h1 text-balance">{item.title}</h1>
        <p className="mt-6 max-w-2xl text-lead text-muted text-pretty">{item.headline}</p>

        <dl className="mt-12 grid gap-8 border-t border-border pt-8 sm:grid-cols-4">
          {[
            ["Client", item.client],
            ["Role", item.role],
            ["Duration", item.duration],
            ["Year", String(item.year)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">
                {label}
              </dt>
              <dd className="mt-2 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {item.signals?.length > 0 && (
        <Section spacing="tight" className="border-y border-border bg-surface/30">
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Outcome
          </p>
          <SignalGrid signals={item.signals} />
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-subtle">
            I don&apos;t publish percentages I can&apos;t stand behind. What I can show is
            scope, longevity and clients who came back — each one confirmed publicly by
            someone who was there.
          </p>
        </Section>
      )}

      <Section>
        <div className="max-w-2xl space-y-6 text-lead leading-relaxed text-muted">
          <p>Public case content goes here once the real material is approved.</p>
        </div>
      </Section>

      <Section spacing="tight">
        {item.deepAccess === "gated" ? (
          <Wall slug={item.slug} title={item.title} />
        ) : (
          <div className="rounded-(--radius-card) border border-border bg-surface px-6 py-12 text-center md:px-16">
            <h2 className="text-h3">Want to talk through this one?</h2>
            <Button href="/call" className="mt-6">
              Book a call
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}
