"use client";

import { useState } from "react";

import { JucaScreen } from "./JucaScreen";
import { cn } from "@/lib/cn";
import { products, statusLabel, type Product } from "@/content/products";

/**
 * A lista de ferramentas da Caáju — substituiu a constelação (ADR-029).
 *
 * POR QUE DEIXOU DE SER GRAFO
 * O grafo argumentava uma tese ("a empresa é modelada por função") e cobrava
 * por isso: para ver UM sistema a pessoa tinha que ler o mapa inteiro. Com a
 * tela de entrada do Juca dentro do /lab, o que o visitante faz aqui mudou —
 * ele escolhe uma ferramenta e entra. Lista à esquerda, ferramenta à direita,
 * e a tela é da ferramenta, não do mapa.
 *
 * ACESSIBILIDADE
 * 1. Os itens são <button> de verdade; a seleção é `aria-pressed`.
 * 2. Nada de hover-para-trocar aqui: trocar um painel de 80% da tela ao passar
 *    o mouse é desorientador. Só clique e teclado.
 * 3. O painel é `aria-live="polite"` — quem tabula pela lista ouve o que abriu.
 * 4. Abaixo de `lg` a lista vira linha rolável acima do painel. Coluna de
 *    20% em tela de celular não é coluna, é tira.
 */

const pontoDeStatus: Record<Product["status"], string> = {
  live: "bg-success",
  building: "bg-warning",
  planned: "bg-subtle",
};

export function ToolsBrowser() {
  const [ativo, setAtivo] = useState<string>("juca");
  const selecionado = products.find((p) => p.slug === ativo) ?? products[0];

  return (
    // 20/80: a lista é índice, a ferramenta é o conteúdo.
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(13rem,1fr)_4fr] lg:items-start">
      <ul className="flex gap-3 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:overflow-visible lg:pb-0">
        {products.map((p) => {
          const aceso = p.slug === ativo;
          return (
            <li key={p.slug} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-pressed={aceso}
                onClick={() => setAtivo(p.slug)}
                className={cn(
                  "w-full rounded-(--radius-card) border bg-surface px-4 py-3 text-left transition-colors",
                  aceso
                    ? "border-inverted"
                    : "border-border hover:border-inverted/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0 rounded-full", pontoDeStatus[p.status])}
                  />
                  <span className="font-display text-sm tracking-tight">{p.name}</span>
                </span>
                <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">
                  {p.domain}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="min-w-0">
        {selecionado.slug === "juca" ? (
          // O Juca mostra a própria porta, e mais nada: sem resumo, sem status
          // em volta. A tela já diz o que é.
          <JucaScreen />
        ) : (
          <div className="rounded-(--radius-card) border border-border bg-surface p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-text">
              {selecionado.domain}
            </p>
            <h2 className="mt-2 font-display text-h3 tracking-tight">{selecionado.name}</h2>
            <p className="mt-2 max-w-2xl text-lead text-muted text-pretty">
              {selecionado.summary}
            </p>
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
        )}
      </div>
    </div>
  );
}
