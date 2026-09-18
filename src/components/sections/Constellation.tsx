"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { core, products, statusLabel, type Product } from "@/content/products";

/**
 * O mapa do ecossistema — grafo interativo, no espírito do Obsidian.
 *
 * COMO ELE EXPLICA
 * Passar o mouse (ou o foco) num sistema acende ele e a ligação dele com o
 * núcleo, apagando o resto. Essa é a mecânica que ensina: em vez de ler seis
 * cartões em paralelo, a pessoa isola um de cada vez e o painel conta o que
 * aquele sistema resolve.
 *
 * DECISÕES DE ACESSIBILIDADE
 * 1. Os nós são <button> de verdade, posicionados por CSS. Nada de SVG
 *    clicável: teclado e leitor de tela funcionam sem inventar `role`.
 * 2. As linhas são decorativas (`aria-hidden`). O que elas dizem —
 *    "este sistema serve à Caáju" — está escrito no painel, não só desenhado.
 * 3. O painel é `aria-live="polite"`: quem navega por teclado ouve o conteúdo
 *    mudar ao tabular entre os nós, sem precisar enxergar o grafo.
 * 4. Sair do hover NÃO limpa a seleção. Painel que esvazia ao mover o mouse
 *    pisca e obriga a ler correndo.
 * 5. Abaixo de `md` o grafo vira grade. Constelação em tela de celular vira
 *    nó espremido — e mapa ilegível não explica nada.
 *
 * O movimento mora no globals.css, e a regra global de prefers-reduced-motion
 * desliga tudo sem nenhum código aqui.
 */

const pontoDeStatus: Record<Product["status"], string> = {
  live: "bg-success",
  building: "bg-warning",
  planned: "bg-subtle",
};

/** Comprimento aproximado da linha, para o desenho progressivo. */
function comprimento(p: Product) {
  const dx = p.position.x - core.position.x;
  const dy = p.position.y - core.position.y;
  return Math.hypot(dx, dy);
}

export function Constellation() {
  const [ativo, setAtivo] = useState<string>(products[0].slug);
  const selecionado = products.find((p) => p.slug === ativo) ?? products[0];

  return (
    <div className="mt-12">
      {/* ── Grafo · a partir de md ───────────────────────────── */}
      <div className="relative hidden aspect-[16/11] md:block">
        <svg
          aria-hidden
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {products.map((p, i) => {
            const aceso = p.slug === ativo;
            return (
              <line
                key={p.slug}
                x1={core.position.x}
                y1={core.position.y}
                x2={p.position.x}
                y2={p.position.y}
                stroke="currentColor"
                strokeWidth={aceso ? 1.4 : 1}
                vectorEffect="non-scaling-stroke"
                className={cn(
                  "transition-all duration-500",
                  aceso ? "text-primary-text" : "text-border",
                )}
                style={{
                  // O tracejado serve ao desenho progressivo e some depois.
                  ["--dash" as string]: comprimento(p),
                  strokeDasharray: comprimento(p),
                  animation: `constellation-draw 900ms var(--ease-out-expo) ${200 + i * 110}ms both`,
                }}
              />
            );
          })}
        </svg>

        {/* Núcleo */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${core.position.x}%`, top: `${core.position.y}%` }}
        >
          <div className="surface-glow rounded-full border border-inverted bg-surface px-8 py-6 text-center">
            <p className="text-gradient font-display text-h3 tracking-tight">{core.name}</p>
            <p className="mt-1 max-w-[20ch] text-xs text-subtle">{core.summary}</p>
          </div>
        </div>

        {/* Sistemas */}
        <ul className="contents">
          {products.map((p, i) => {
            const aceso = p.slug === ativo;
            return (
              <li
                key={p.slug}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${p.position.x}%`,
                  top: `${p.position.y}%`,
                  animation: [
                    `constellation-in 600ms var(--ease-out-expo) ${300 + i * 110}ms both`,
                    `constellation-drift ${7 + (i % 3)}s ease-in-out ${i * 0.6}s infinite`,
                  ].join(", "),
                }}
              >
                <button
                  type="button"
                  aria-pressed={aceso}
                  onMouseEnter={() => setAtivo(p.slug)}
                  onFocus={() => setAtivo(p.slug)}
                  onClick={() => setAtivo(p.slug)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full border px-4 py-2.5 transition-all duration-300",
                    aceso
                      ? "surface-glow border-inverted bg-surface-alt"
                      : "border-border bg-surface opacity-70 hover:opacity-100",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0 rounded-full", pontoDeStatus[p.status])}
                  />
                  <span className="font-display text-sm tracking-tight">{p.name}</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">
                    {p.domain}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Grade · abaixo de md ─────────────────────────────── */}
      <ul className="grid grid-cols-2 gap-3 md:hidden">
        {products.map((p) => {
          const aceso = p.slug === ativo;
          return (
            <li key={p.slug}>
              <button
                type="button"
                aria-pressed={aceso}
                onClick={() => setAtivo(p.slug)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-(--radius-button) border px-3 py-3 text-left transition-colors",
                  aceso ? "border-inverted bg-surface-alt" : "border-border bg-surface",
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-1.5 shrink-0 rounded-full", pontoDeStatus[p.status])}
                />
                <span className="font-display text-sm tracking-tight">{p.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── Painel ───────────────────────────────────────────── */}
      <div
        aria-live="polite"
        className="mt-8 min-h-44 rounded-(--radius-card) border border-border bg-surface p-6 md:mt-4 md:p-8"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-text">
          {selecionado.domain}
        </p>
        <h2 className="mt-2 font-display text-h3 tracking-tight">{selecionado.name}</h2>
        <p className="mt-2 max-w-2xl text-lead text-muted text-pretty">{selecionado.summary}</p>
        <p className="mt-3 max-w-2xl text-sm text-subtle text-pretty">{selecionado.role}</p>

        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="font-mono uppercase tracking-[0.14em] text-subtle">
            {statusLabel[selecionado.status]}
          </span>
          {selecionado.url ? (
            <a href={selecionado.url} className="text-primary-text underline underline-offset-4">
              Sign in to {selecionado.name} →
            </a>
          ) : (
            // Silêncio aqui faz o visitante procurar um link que não existe.
            <span className="text-subtle">No sign in yet</span>
          )}
        </p>
      </div>
    </div>
  );
}
