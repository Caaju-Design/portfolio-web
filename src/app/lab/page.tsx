import type { Metadata } from "next";

import { Constellation } from "@/components/sections/Constellation";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Six systems that run Caáju — money, signal, craft, revenue, people and trust. Built in-house, and honest about what is finished.",
  alternates: { canonical: "/lab" },
};

export default function LabPage() {
  return (
    <Section spacing="loose">
      <SectionHeader
        as="h1"
        eyebrow="Lab"
        title="The studio runs on software I built"
        description="Every company has the same six problems: money, information, craft, revenue, people and trust. I gave each one a system instead of a spreadsheet. Two are in production, one is being built, three are still a plan — and the map says which is which."
      />

      <Constellation />

      <div className="mt-14 grid max-w-4xl gap-6 border-t border-border pt-8 md:grid-cols-2">
        <p className="text-sm text-muted text-pretty">
          None of these started as a product idea. Each one started as a problem in my own
          week that a spreadsheet stopped being able to hold.
        </p>
        <p className="text-sm text-muted text-pretty">
          They run on the same stack I would put in front of a client, and they are held to
          the same bar — which is exactly why the unfinished ones say so rather than
          borrowing credit from the finished ones.
        </p>
      </div>
    </Section>
  );
}
