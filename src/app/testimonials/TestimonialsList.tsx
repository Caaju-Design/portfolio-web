"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  relationshipLabel,
  testimonials,
  type Relationship,
} from "@/content/testimonials";

type Filter = "all" | Relationship;

/**
 * O filtro "Direct report" é o mais persuasivo do site para quem avalia um
 * design lead — e quase ninguém no mercado consegue oferecê-lo, porque exige
 * ter liderado de verdade.
 */
const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "client", label: "Clients" },
  { key: "manager", label: "Managers" },
  { key: "direct-report", label: "Direct reports" },
  { key: "peer", label: "Peers" },
];

export function TestimonialsList() {
  const [active, setActive] = useState<Filter>("all");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["all", testimonials.length]]);
    for (const t of testimonials) {
      map.set(t.relationship, (map.get(t.relationship) ?? 0) + 1);
    }
    return map;
  }, []);

  const list = useMemo(
    () =>
      (active === "all"
        ? testimonials
        : testimonials.filter((t) => t.relationship === active)
      ).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [active],
  );

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by relationship">
        {filters.map((f) => {
          const count = counts.get(f.key) ?? 0;
          if (!count) return null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              aria-pressed={active === f.key}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === f.key
                  ? "border-primary/60 bg-primary/10 text-text"
                  : "border-border text-muted hover:border-primary/30 hover:text-text",
              )}
            >
              {f.label}
              <span className="ml-2 text-xs text-subtle">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {list.map((t) => (
          <Card key={t.id} className="flex flex-col justify-between">
            <blockquote className="leading-relaxed text-text/90 text-pretty">
              &ldquo;{t.quoteEn}&rdquo;
            </blockquote>
            <footer className="mt-6 flex gap-4 border-t border-border pt-5">
              <Avatar name={t.authorName} src={t.authorPhoto} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.authorName}</p>
                <p className="text-sm text-muted">
                  {t.authorTitle}
                  {t.authorCompany && ` · ${t.authorCompany}`}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {relationshipLabel[t.relationship]}
                  </span>
                  <time dateTime={t.date}>
                    {new Date(t.date).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                  {t.originalLanguage === "pt" && <span>Translated from Portuguese</span>}
                </p>
              </div>
            </footer>
          </Card>
        ))}
      </div>
    </>
  );
}
