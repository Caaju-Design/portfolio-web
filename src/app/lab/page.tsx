import type { Metadata } from "next";

import { Constellation } from "@/components/sections/Constellation";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "The internal tools I built to run Caáju — a daily briefing, a delivery workspace and the system that will run the company's finances.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  return (
    <Section spacing="loose">
      <SectionHeader
        as="h1"
        eyebrow="Lab"
        title="The tools I built to run the studio"
        description="I ask clients to trust me with their product. It seems fair to show what I build when the product is my own — and to keep it honest about what is finished and what is not."
      />

      <Constellation />

      <div className="mt-16 max-w-2xl border-t border-border pt-8">
        <p className="text-sm text-muted text-pretty">
          Each of these started as a problem in my own week, not as a product idea. They
          run on the same stack I would put in front of a client — and they are held to
          the same bar, which is why the unfinished ones say so.
        </p>
      </div>
    </Section>
  );
}
