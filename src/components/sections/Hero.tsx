import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Placeholder do background WebGL — trocado por R3F na fase de animação.
          Mantido em CSS por enquanto para não comprometer o LCP. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-fade opacity-70" />
      {/* AQUI HAVIA UM BORRAO RADIAL de ciano para roxo, blur de 120px. Saiu por
          dois motivos, nenhum de gosto: o roxo nao existe mais (destaque unico),
          e lima borrado sobre fundo claro nao vira brilho — vira mancha amarela.
          As referencias sao chapadas: a profundidade vem do contraste entre
          fundo e superficie, nao de luz falsa. */}

      <Container>
        <div className="relative flex flex-col justify-center py-28 md:py-40">
          <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {site.availability}
          </p>

          {/* O lima entra como BLOCO, nunca como letra: sobre fundo claro ele
              mede 1,04:1 como cor de texto. Preenchido, com conteudo escuro em
              cima, e o gesto das referencias. `box-decoration-clone` mantem o
              preenchimento inteiro quando a linha quebra. */}
          <h1 className="max-w-4xl text-display text-balance">
            Product leadership for teams that{" "}
            <span className="bg-primary text-on-primary box-decoration-clone px-2">
              outgrew their design
            </span>
            .
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
