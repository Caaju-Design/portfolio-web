import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export function FinalCta() {
  return (
    <Section spacing="loose">
      <div className="surface-glow relative overflow-hidden rounded-(--radius-card) border border-primary/30 bg-surface px-6 py-16 text-center md:px-16 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-30 blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, var(--color-primary), transparent)",
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-h1 text-balance">
            If you&apos;re building a product and need someone who connects strategy, experience,
            systems and execution — let&apos;s talk.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lead text-muted">
            {site.availability}. A 45-minute call is enough to know whether it fits.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/call" size="lg">
              Book a call
            </Button>
            <Button href="/how-we-work" size="lg" variant="secondary">
              How engagements work
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
