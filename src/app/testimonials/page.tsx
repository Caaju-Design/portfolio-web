import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { site } from "@/lib/site";
import { testimonials } from "@/content/testimonials";
import { TestimonialsList } from "./TestimonialsList";

export const metadata: Metadata = {
  title: "References",
  description:
    "26 public LinkedIn recommendations — from clients who hired Emanuel Ágape, managers he reported to, and designers who reported to him.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  const clients = testimonials.filter((t) => t.relationship === "client").length;
  const reports = testimonials.filter((t) => t.relationship === "direct-report").length;

  return (
    <>
      <Section spacing="loose">
        <SectionHeader
          eyebrow="References"
          title="What the people who worked with me say"
          description={`${testimonials.length} public recommendations on LinkedIn — including ${clients} clients who hired me and ${reports} designers who reported to me directly.`}
        />
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-subtle">
          Every one of these is public and verifiable on my LinkedIn profile. Ones written
          in Portuguese are translated here, preserving the author&apos;s voice — nothing
          was rewritten or embellished.
        </p>
        <Button href={site.social.linkedin} variant="secondary" className="mt-8">
          Verify on LinkedIn
        </Button>
      </Section>

      <Section spacing="tight">
        <TestimonialsList />
      </Section>
    </>
  );
}
