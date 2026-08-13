import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Placeholder do background WebGL — trocado por R3F na fase de animação.
          Mantido em CSS por enquanto para não comprometer o LCP. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-primary), var(--color-accent), transparent)",
        }}
      />

      <Container>
        <div className="relative flex flex-col justify-center py-28 md:py-40">
          <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {site.availability}
          </p>

          <h1 className="max-w-4xl text-display text-balance">
            Product leadership for teams that{" "}
            <span className="text-gradient">outgrew their design</span>.
          </h1>

          <p className="mt-8 max-w-2xl text-lead text-muted text-pretty">
            I&apos;m Emanuel Ágape — a Fractional Product Design Lead. I bring senior product
            direction, design systems and AI-assisted workflows to SaaS teams that need a design
            leader without the cost and timeline of a full-time hire.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/call" size="lg">
              Book a call
            </Button>
            <Button href="/work" size="lg" variant="secondary">
              See the work
            </Button>
          </div>

          <p className="mt-12 max-w-2xl text-sm text-subtle">
            9 years in product · Enterprise and B2B SaaS · {site.location.city} (
            {site.location.timezone}) — {site.overlap}.
          </p>
        </div>
      </Container>
    </section>
  );
}
