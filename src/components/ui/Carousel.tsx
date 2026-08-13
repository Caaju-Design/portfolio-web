"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Trilho horizontal com setas, snap e máscaras de borda.
 *
 * Mesmo padrão do seletor de dias do agendamento — extraído aqui para virar
 * primitivo do design system em vez de existir duas vezes.
 *
 * Acessibilidade: o trilho é focável e navegável por teclado. Scroll horizontal
 * sem acesso por teclado é armadilha comum de carrossel.
 */
export function Carousel({
  children,
  header,
  scrollByCards = 1,
  className,
  label,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollByCards?: number;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, children]);

  const scroll = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const card = el.firstElementChild as HTMLElement | null;
      const gap = 24;
      const step = card ? (card.offsetWidth + gap) * scrollByCards : el.clientWidth;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollBy({ left: direction * step, behavior: reduced ? "auto" : "smooth" });
    },
    [scrollByCards],
  );

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">{header}</div>
        <div className="hidden shrink-0 gap-1 md:flex">
          <Arrow dir="prev" disabled={!edges.left} onClick={() => scroll(-1)} />
          <Arrow dir="next" disabled={!edges.right} onClick={() => scroll(1)} />
        </div>
      </div>

      <div className="relative mt-10">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent transition-opacity duration-300",
            edges.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent transition-opacity duration-300",
            edges.right ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={ref}
          onScroll={sync}
          tabIndex={0}
          role="region"
          aria-label={label}
          className="no-scrollbar flex snap-x gap-6 overflow-x-auto pb-2"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Arrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      className={cn(
        "grid size-9 place-items-center rounded-full border transition-all duration-200",
        disabled
          ? "cursor-default border-border/40 text-muted/25"
          : "border-border text-muted hover:border-primary/50 hover:bg-primary/10 hover:text-text active:scale-90",
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
        <path
          d={dir === "prev" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
