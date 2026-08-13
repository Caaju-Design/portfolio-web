import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Client area",
  robots: { index: false, follow: false, nocache: true },
};

const tools = [
  { href: "/client/insights", title: "Insights", body: "Who is reading your work and how close they are to a conversation." },
];

export default async function ClientPage() {
  const admin = await requireAdmin();

  return (
    <Section spacing="loose">
      <SectionHeader eyebrow={admin.email} title="Client area" />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card interactive className="h-full">
              <h2 className="text-h3">{tool.title}</h2>
              <p className="mt-3 text-sm text-muted">{tool.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
