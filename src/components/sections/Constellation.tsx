import { cn } from "@/lib/cn";
import { core, products, statusLabel, type Product } from "@/content/products";

/**
 * A constelação do ecossistema.
 *
 * DECISÕES DE ACESSIBILIDADE, porque um mapa bonito costuma excluir gente:
 *
 * 1. As linhas são SVG decorativo (`aria-hidden`). A informação que elas
 *    carregam — "este produto serve à Caáju" — está escrita no texto de
 *    cada nó, não só desenhada.
 * 2. Os nós são âncoras de verdade, posicionadas por CSS. Nada de elemento
 *    SVG clicável: leitor de tela e navegação por teclado funcionam de graça.
 * 3. A ordem no DOM é a ordem de leitura, independente da posição visual.
 * 4. Abaixo de `md` o mapa vira lista empilhada. Constelação em tela de
 *    celular vira nó espremido — e um mapa ilegível não informa ninguém.
 *
 * O foco visível vem do `:focus-visible` global em globals.css.
 */

const statusDot: Record<Product["status"], string> = {
  live: "bg-success",
  building: "bg-warning",
  planned: "bg-subtle",
};

function Node({ product }: { product: Product }) {
  const conteudo = (
    <>
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", statusDot[product.status])}
        />
        <span className="font-display text-h3 tracking-tight">{product.name}</span>
      </span>
      <span className="mt-1 block text-sm text-muted">{product.summary}</span>
      <span className="mt-3 block text-xs text-subtle">{product.role}</span>
      <span className="mt-4 flex items-center gap-2 text-xs">
        <span className="font-mono uppercase tracking-[0.14em] text-subtle">
          {statusLabel[product.status]}
        </span>
        {/* "Sign in", nao so uma seta: quem chega sem conta precisa saber que a
            porta pede chave ANTES de clicar. E quando a porta ainda nao existe,
            dizer isso — silencio ali faz o visitante procurar link que nao ha.
            `status` fala do PRODUTO, `url` fala da PORTA: o Bonner roda em
            producao todo dia util e ainda assim nao tem tela. */}
        {product.url ? (
          <span className="text-primary">Sign in →</span>
        ) : (
          <span className="text-subtle">Sign in soon</span>
        )}
      </span>
    </>
  );

  const base =
    "block w-full rounded-(--radius-card) border border-border bg-surface p-5 text-left " +
    "transition-colors md:w-64";

  if (!product.url) {
    return <div className={base}>{conteudo}</div>;
  }

  return (
    <a
      href={product.url}
      className={cn(base, "hover:border-primary/50 hover:bg-surface-alt")}
    >
      {conteudo}
      <span className="sr-only">— opens the {product.name} sign in screen</span>
    </a>
  );
}

export function Constellation() {
  return (
    <div className="mt-14">
      {/* ── Mapa: só a partir de md ───────────────────────────── */}
      <div className="relative hidden aspect-[16/11] md:block">
        <svg
          aria-hidden
          className="absolute inset-0 size-full text-border"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {products.map((p) => (
            <line
              key={p.slug}
              x1={core.position.x}
              y1={core.position.y}
              x2={p.position.x}
              y2={p.position.y}
              stroke="currentColor"
              strokeWidth="0.15"
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${core.position.x}%`, top: `${core.position.y}%` }}
        >
          <div className="surface-glow rounded-full border border-primary/40 bg-surface px-7 py-5 text-center">
            <p className="font-display text-h3 tracking-tight text-gradient">{core.name}</p>
            <p className="mt-1 max-w-[18ch] text-xs text-subtle">{core.summary}</p>
          </div>
        </div>

        <ul className="contents">
          {products.map((p) => (
            <li
              key={p.slug}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.position.x}%`, top: `${p.position.y}%` }}
            >
              <Node product={p} />
            </li>
          ))}
        </ul>
      </div>

      {/* ── Lista: abaixo de md ───────────────────────────────── */}
      <ul className="grid gap-4 md:hidden">
        {products.map((p) => (
          <li key={p.slug}>
            <Node product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
