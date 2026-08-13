import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = { title: "Verifying", robots: { index: false, follow: false } };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const { case: caseSlug } = await searchParams;

  return (
    <Section spacing="loose">
      <VerifyClient caseSlug={caseSlug ?? ""} />
    </Section>
  );
}
