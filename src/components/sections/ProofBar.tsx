import { Container } from "@/components/ui/Container";

/** Logos entram quando a autorização de uso for confirmada (ver testimonials.md §7). */
const clients = ["Carrefour Brasil", "Riskex", "RD", "Banco BRB", "Stone", "Idez"];

export function ProofBar() {
  return (
    <section className="border-y border-border bg-surface/30 py-10" aria-label="Clients">
      <Container>
        <p className="mb-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-subtle">
          Product work delivered for
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {clients.map((c) => (
            <li
              key={c}
              className="font-display text-sm font-medium text-subtle transition-colors hover:text-text"
            >
              {c}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
