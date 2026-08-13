import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { BookingWidget } from "./BookingWidget";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "A 30-minute call to work out whether a fractional design lead is the right fit for your team.",
  alternates: { canonical: "/call" },
};

const agenda = [
  "Where the product is and what's actually blocking design",
  "Whether the problem needs a lead, a system, or discovery",
  "Which engagement fits — including the answer 'none of them'",
  "Timeline, scope and next step",
];

export default function CallPage() {
  return (
    <Section spacing="loose">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            45 minutes
          </p>
          <h1 className="mt-4 text-h1 text-balance">Let&apos;s see if it fits</h1>
          <p className="mt-6 text-lead text-muted text-pretty">
            No deck, no pitch. Forty-five minutes to understand your situation and tell
            you honestly whether I&apos;m the right call.
          </p>

          <h2 className="mt-12 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
            What we&apos;ll cover
          </h2>
          <ul className="mt-5 space-y-3">
            {agenda.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-muted">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm text-subtle">
            {site.location.city} ({site.location.timezone}) — {site.overlap}. Slots are
            shown in your own timezone.
          </p>
        </div>

        <BookingWidget />

      </div>
    </Section>
  );
}
