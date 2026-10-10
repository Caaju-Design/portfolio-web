import { cn } from "@/lib/cn";

/**
 * Renderizador dos blocos do case (content-model.md §2).
 *
 * Server Component de proposito: e o mesmo componente que vai renderizar os
 * deepBlocks, e conteudo restrito nunca vira prop de Client Component.
 *
 * Texto aceita so **negrito**, *italico* e `codigo`. Nada de HTML vindo do
 * banco — sem dangerouslySetInnerHTML, um campo adulterado no Firestore vira
 * texto na tela, nunca script.
 *
 * Tipo desconhecido nao quebra a pagina: some, e o resto do case renderiza.
 */

export type Block =
  | { type: "lead"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title?: string; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "image"; alt: string; caption?: string; src?: string }
  | { type: "timeline"; title?: string; items: { when: string; what: string }[] };

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold text-text">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="font-mono text-[0.9em]">
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
        return p;
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="text-lead leading-relaxed text-text text-pretty">
          <Inline text={block.text} />
        </p>
      );

    case "heading":
      return <h2 className="pt-10 text-h2 text-balance">{block.text}</h2>;

    case "paragraph":
      return (
        <p className="leading-relaxed text-muted text-pretty">
          <Inline text={block.text} />
        </p>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={cn(
            "space-y-3 pl-5 leading-relaxed text-muted",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-1 text-pretty">
              <Inline text={item} />
            </li>
          ))}
        </Tag>
      );
    }

    case "callout":
      return (
        <aside className="rounded-(--radius-card) bg-primary px-6 py-6 text-on-primary md:px-8">
          {block.title && <p className="font-display text-lg leading-tight">{block.title}</p>}
          <p className={cn("leading-relaxed text-pretty", block.title && "mt-3")}>
            <Inline text={block.text} />
          </p>
        </aside>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-inverted pl-6">
          <p className="font-display text-2xl leading-snug text-balance">
            <Inline text={block.text} />
          </p>
          {block.author && <footer className="mt-3 text-sm text-subtle">{block.author}</footer>}
        </blockquote>
      );

    case "image":
      return (
        <figure>
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.src} alt={block.alt} className="w-full rounded-(--radius-card)" />
          ) : (
            // Slot reservado: o case sobe antes das imagens e o layout ja nasce no lugar.
            <div
              role="img"
              aria-label={block.alt}
              className="flex aspect-video w-full items-center justify-center rounded-(--radius-card) border border-dashed border-border bg-surface px-6 text-center"
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">
                Image coming soon
              </span>
            </div>
          )}
          {block.caption && (
            <figcaption className="mt-3 text-xs text-subtle">
              <Inline text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "timeline":
      return (
        <div>
          {block.title && (
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-primary-text">
              {block.title}
            </p>
          )}
          <dl className="divide-y divide-border border-y border-border">
            {block.items.map((item, i) => (
              <div key={i} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-subtle">
                  {item.when}
                </dt>
                <dd className="text-sm text-muted">
                  <Inline text={item.what} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );

    default:
      return null;
  }
}

export function Blocks({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cn("max-w-2xl space-y-6", className)}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
