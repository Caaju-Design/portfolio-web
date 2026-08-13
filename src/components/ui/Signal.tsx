import { cn } from "@/lib/cn";

/**
 * Prova de resultado. Substitui o antigo componente de "métrica".
 * Ver content-model.md §8 — não temos números históricos, então
 * provamos por escopo, longevidade, recontratação e time.
 */
export type SignalKind = "scope" | "longevity" | "repeat" | "team" | "artifact" | "metric";

export type SignalData = {
  kind: SignalKind;
  value: string;
  label: string;
  context?: string;
  attestedBy?: string;
};

const kindLabel: Record<SignalKind, string> = {
  scope: "Scope",
  longevity: "Longevity",
  repeat: "Repeat engagement",
  team: "Team",
  artifact: "Artifact",
  metric: "Metric",
};

export function Signal({ data, className }: { data: SignalData; className?: string }) {
  return (
    <div className={cn("border-l-2 border-primary/40 pl-5", className)}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
        {kindLabel[data.kind]}
      </p>
      <p className="mt-2 font-display text-2xl leading-tight text-text text-balance">
        {data.value}
      </p>
      <p className="mt-1 text-sm text-muted">{data.label}</p>
      {data.context && <p className="mt-1 text-xs text-subtle">{data.context}</p>}
      {data.attestedBy && (
        <p className="mt-2 text-xs text-primary/80">Attested publicly by {data.attestedBy}</p>
      )}
    </div>
  );
}

export function SignalGrid({ signals }: { signals: SignalData[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {signals.map((s, i) => (
        <Signal key={i} data={s} />
      ))}
    </div>
  );
}
