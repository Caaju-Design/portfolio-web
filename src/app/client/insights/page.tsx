import type { Metadata } from "next";

import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { requireAdmin } from "@/lib/admin";
import { getInsights } from "@/lib/insights";
import { cn } from "@/lib/cn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Insights",
  robots: { index: false, follow: false, nocache: true },
};

const relative = (date: Date) => {
  const mins = Math.round((Date.now() - date.getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};

export default async function InsightsPage() {
  const admin = await requireAdmin();

  // Painel interno não deve derrubar com 500. Se a agregação falhar, mostramos
  // o motivo — em dev com detalhe, em produção sem vazar interno.
  let data: Awaited<ReturnType<typeof getInsights>> | null = null;
  let failure: string | null = null;
  try {
    data = await getInsights();
  } catch (error) {
    console.error("[insights] agregação falhou", error);
    failure =
      process.env.NODE_ENV === "production"
        ? "Could not load insights."
        : String((error as Error)?.message ?? error);
  }

  if (!data) {
    return (
      <Section spacing="loose">
        <SectionHeader eyebrow={admin.email} title="Insights unavailable" />
        <pre className="mt-8 overflow-x-auto rounded-(--radius-card) border border-border bg-surface p-6 text-sm text-warning">
          {failure}
        </pre>
      </Section>
    );
  }

  const { signals, funnel, committees, logs, leads, denied } = data;

  return (
    <>
      <Section spacing="tight">
        <SectionHeader
          eyebrow={`Signed in as ${admin.email}`}
          title="Insights"
          description="Who is reading your client material, and how close they are to a conversation."
        />
      </Section>

      {/* 1 — Intenção. O bloco mais importante fica no topo. */}
      <Section spacing="tight">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Buying signals
        </h2>

        {signals.length === 0 ? (
          <p className="mt-6 text-muted">
            No signals yet. They appear once someone requests access to a gated case.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {signals.map((s) => (
              <Card key={s.email} className="flex flex-wrap items-center gap-6 py-5">
                <div
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full font-display text-sm font-semibold",
                    s.score >= 70
                      ? "bg-primary/15 text-primary"
                      : s.score >= 40
                        ? "bg-accent/15 text-accent"
                        : "bg-surface-alt text-muted",
                  )}
                >
                  {s.score}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.email}</p>
                  <p className="text-sm text-muted">
                    {s.company ?? s.domain} · {s.views} view{s.views === 1 ? "" : "s"} ·{" "}
                    {relative(s.lastSeen)}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {s.reasons.map((r) => (
                      <li
                        key={r}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-subtle"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`mailto:${s.email}`}
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  Email
                </a>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* 2 — Comitê de compra: o sinal mais subestimado */}
      {committees.length > 0 && (
        <Section spacing="tight">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Buying committees forming
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            More than one person from the same company looked at your work. That is not a
            lead — that is a decision already in progress.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {committees.map((c) => (
              <Card key={c.domain}>
                <p className="font-display text-lg">{c.domain}</p>
                <ul className="mt-3 space-y-1">
                  {c.people.map((p) => (
                    <li key={p} className="text-sm text-muted">
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 3 — Funil */}
      <Section spacing="tight">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Funnel</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {funnel.map((step) => (
            <Card key={step.label}>
              <p className="font-display text-3xl">{step.value}</p>
              <p className="mt-1 text-sm text-muted">{step.label}</p>
              {step.hint && <p className="mt-2 text-xs text-subtle">{step.hint}</p>}
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-subtle">
          {leads.length} leads on record · {logs.length} access events in the last window
        </p>
      </Section>

      {/* 4 — Auditoria: o que o NDA exige */}
      <Section spacing="tight">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Access log
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Every access to restricted material, with who and when. This is what you hand a
          client who asks who has seen their work.
        </p>

        <div className="mt-6 overflow-x-auto rounded-(--radius-card) border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.slice(0, 40).map((log, i) => (
                <tr key={i} className="bg-surface/40">
                  <td className="whitespace-nowrap px-4 py-3 text-subtle">
                    {relative(log.timestamp)}
                  </td>
                  <td className="max-w-56 truncate px-4 py-3">{log.email}</td>
                  <td className="px-4 py-3 text-muted">{log.action}</td>
                  <td className="px-4 py-3 text-muted">{log.caseSlug ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No access events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {denied.length > 0 && (
          <p className="mt-4 text-xs text-warning">
            {denied.length} denied attempts in this window — possible automated probing.
          </p>
        )}
      </Section>
    </>
  );
}
