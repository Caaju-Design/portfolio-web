import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { AccessForm } from "./AccessForm";

export const metadata: Metadata = {
  title: "Request access",
  robots: { index: false, follow: false },
};

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Extrai o slug do path pedido: /work/<slug>/deep
  const caseSlug = next?.match(/^\/work\/([^/]+)\/deep$/)?.[1] ?? "";

  return (
    <Section spacing="loose">
      <div className="mx-auto max-w-lg">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Confidential material
        </p>
        <h1 className="mt-4 text-h1 text-balance">This case study goes deeper</h1>
        <p className="mt-5 text-lead text-muted text-pretty">
          The full breakdown — artefacts, final screens, decisions and the client&apos;s own
          words — is client material under NDA. I keep it behind a named link and log every
          access, because that&apos;s what those agreements require.
        </p>
        <p className="mt-4 text-sm text-subtle">
          No password to share around. You get a link tied to your address, valid for 15 minutes.
        </p>

        <div className="mt-10">
          <AccessForm caseSlug={caseSlug} />
        </div>
      </div>
    </Section>
  );
}
