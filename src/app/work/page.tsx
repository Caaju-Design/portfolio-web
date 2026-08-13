import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { listCases } from "@/lib/cases";

/**
 * ISR: HTML servido do CDN, regenerado a cada hora.
 *
 * Estática pura exigiria redeploy para um case novo aparecer. Dinâmica cobraria
 * uma leitura do Firestore por visita, na página de maior tráfego, para um
 * conteúdo que muda raramente. Uma hora é o meio-termo: publicou, aparece.
 *
 * Efeito colateral aceito: o build continua consultando o Firestore para gerar
 * a primeira versão. Se o banco estiver indisponível, o deploy falha — ver
 * ADR-023. A saída de emergência é trocar esta linha por
 * `export const dynamic = "force-dynamic"`.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected product design work for enterprise and B2B SaaS teams — design systems, discovery and product leadership.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const cases = await listCases();

  return (
    <Section spacing="loose">
      <SectionHeader
        eyebrow="Selected work"
        title="Fewer cases, told properly"
        description="Three engagements worth reading in full, rather than a gallery of thumbnails. Each one shows the decisions, not just the screens."
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {cases.map((item) => (
          <Link key={item.slug} href={`/work/${item.slug}`} className="group">
            <Card interactive className="flex h-full flex-col">
              <div className="flex items-center gap-2">
                <Badge>{item.industry.replace(/-/g, " ")}</Badge>
                {item.deepAccess === "gated" && <Badge tone="accent">Client access</Badge>}
              </div>

              <h2 className="mt-6 text-h3 transition-colors group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted text-pretty">
                {item.headline}
              </p>

              {item.signals?.[0] && (
                <p className="mt-6 border-l-2 border-primary/40 pl-4 font-display text-lg leading-tight">
                  {item.signals[0].value}
                </p>
              )}

              <p className="mt-6 text-xs text-subtle">
                {item.role} · {item.year} · {item.duration}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {cases.length === 0 && (
        <p className="mt-16 text-muted">No published cases yet.</p>
      )}
    </Section>
  );
}
