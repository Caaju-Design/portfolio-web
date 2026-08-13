import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { Section, SectionHeader } from "@/components/ui/Section";
import { featured, relationshipLabel, testimonials } from "@/content/testimonials";

/**
 * Carrossel em vez de grid: ocupa menos altura na home e o gesto de arrastar
 * convida a ler o próximo. O grid completo vive em /testimonials.
 */
export function Testimonials() {
  const clients = testimonials.filter((t) => t.relationship === "client").length;
  const reports = testimonials.filter((t) => t.relationship === "direct-report").length;

  return (
    <Section spacing="tight">
      <Carousel
        label="References"
        header={
          <SectionHeader
            eyebrow="Verified references"
            title="What the people who worked with me say"
            description={`${testimonials.length} public recommendations on LinkedIn — including ${reports} designers who reported to me directly and ${clients} clients who hired me.`}
          />
        }
      >
        {featured.map((t) => (
          <Link
            key={t.id}
            href="/testimonials"
            className="w-[min(85vw,24rem)] shrink-0 snap-start"
          >
          <Card interactive className="flex h-full flex-col justify-between">
            {/*
              8 linhas: o suficiente para o depoimento respirar sem que o card
              vire parede de texto. O card inteiro é link para /testimonials,
              então não gastamos altura com um CTA repetido.
            */}
            <blockquote className="line-clamp-8 leading-relaxed text-text/90 text-pretty">
              &ldquo;{t.quoteEn}&rdquo;
            </blockquote>
            <footer className="mt-6 flex gap-4 border-t border-border pt-5">
              <Avatar name={t.authorName} src={t.authorPhoto} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.authorName}</p>
                <p className="text-sm text-muted">
                  {t.authorTitle} · {t.authorCompany}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle">
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {relationshipLabel[t.relationship]}
                  </span>
                  {t.originalLanguage === "pt" && <span>Translated from Portuguese</span>}
                </p>
              </div>
            </footer>
          </Card>
          </Link>
        ))}
      </Carousel>

      <div className="mt-10">
        <Button href="/testimonials" variant="secondary">
          Read all {testimonials.length}
        </Button>
      </div>
    </Section>
  );
}
