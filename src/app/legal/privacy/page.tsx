import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How personal data is collected, used and deleted on caaju.com.br.",
  alternates: { canonical: "/legal/privacy" },
};

/**
 * ⚠️ RASCUNHO — precisa de revisão jurídica antes do lançamento.
 * Descreve o comportamento real implementado no código. Não copiar modelo
 * genérico: política que não corresponde ao sistema é pior que nenhuma.
 */
const POLICY_VERSION = "2026-08";

const sections = [
  {
    title: "What I collect, and only when you give it",
    body: [
      "When you request access to a restricted case study, I collect your email address and, if you provide them, your company and role.",
      "When you book a call, I collect your name, email, company and whatever you write in the notes field.",
      "In both cases I also record the time, your IP address, browser user agent and the timezone your browser reports.",
      "I do not use advertising cookies, tracking pixels or analytics that follow you across other websites.",
    ],
  },
  {
    title: "Why",
    body: [
      "To grant and manage your access to material shared under NDA with my clients.",
      "To keep an access log, which is what those NDAs require of me. If a client asks who has viewed their material, I have to be able to answer.",
      "To schedule and hold the call you booked.",
      "To follow up about working together, if that's clearly what the contact was about.",
      "Legal basis: legitimate interest for the access log and for follow-up, and performance of a contract for scheduling. Where consent is required, it is asked for at the point of collection.",
    ],
  },
  {
    title: "How long I keep it",
    body: [
      "Lead and access records are deleted automatically 24 months after the first contact. This is enforced by an automatic retention policy on the database, not by someone remembering to do it.",
      "Calendar events remain in my Google Calendar under Google's own retention.",
    ],
  },
  {
    title: "Who else sees it",
    body: [
      "Google Cloud and Firebase host the data (United States region) and Vercel serves the site.",
      "Google Calendar receives your booking details so the invitation can be sent.",
      "A private automation service receives access notifications so I know when to follow up.",
      "I do not sell personal data, and I do not share it for anyone else's marketing.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Under the GDPR and Brazil's LGPD you can ask for a copy of your data, ask for it to be corrected, ask for it to be deleted, or object to my processing of it.",
      `Write to ${site.email} and I'll action it. No form, no ticket queue.`,
    ],
  },
  {
    title: "Security",
    body: [
      "Restricted case material is never sent to a browser without a valid session. The database denies all direct client access; every read happens server-side.",
      "Access links are tied to a single email address and expire. There is no shared password.",
      "Access to restricted material is logged with the email, time and user agent.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Section spacing="loose">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Version {POLICY_VERSION}
        </p>
        <h1 className="mt-4 text-h1">Privacy</h1>
        <p className="mt-6 text-lead text-muted text-pretty">
          Short version: I collect the minimum needed to give you access to client material
          and to talk to you, I log it because my clients&apos; NDAs require it, I delete it
          after 24 months, and I don&apos;t sell any of it.
        </p>

        <div className="mt-16 space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-h3">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((p) => (
                  <p key={p} className="leading-relaxed text-muted text-pretty">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-border pt-8 text-sm text-subtle">
          Data controller: {site.legalEntity}, {site.location.city}, {site.location.country}.
          Contact: {site.email}.
        </p>
      </div>
    </Section>
  );
}
