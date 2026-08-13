import { Button } from "@/components/ui/Button";

/**
 * O muro. Fica no fim do case público, no ponto de maior interesse.
 *
 * Posicionamento deliberado: pedir e-mail na porta de entrada derruba a taxa
 * de captura, porque o visitante ainda não sabe se vale. Pedir depois que ele
 * leu contexto, problema e resultado converte muito mais.
 * Ver docs/content-model.md §0.
 */
export function Wall({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-(--radius-card) border border-primary/25 bg-surface">
      {/* Degradê sugerindo conteúdo continuando por baixo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-surface"
      />
      <div className="px-6 py-14 text-center md:px-16">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Continues behind a named link
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl text-h2 text-balance">
          The rest of {title} is client material
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted text-pretty">
          Artefacts, final screens, the decisions behind them and the client&apos;s own words.
          It sits under NDA, so I keep it behind a link tied to your name and log every access.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button href={`/access?next=/work/${slug}/deep`} size="lg">
            Get access
          </Button>
          <Button href="/call" size="lg" variant="secondary">
            Just book a call
          </Button>
        </div>
        <p className="mt-6 text-xs text-subtle">
          No shared password. Takes about 30 seconds.
        </p>
      </div>
    </div>
  );
}
