"use client";

/**
 * O menu principal como trilho em pílula, com o realce lima deslizando até a página atual.
 *
 * Vem do seletor Research / Code / Refine do Studio do PORTINARI: trilho branco com borda,
 * itens em `muted`, e o item atual sobre uma pílula `primary` com texto `on-primary`.
 *
 * ⚠️ A pílula é UM elemento que se move, e não um fundo por item. Fundo por item só troca
 *    de lugar; o que dá a sensação de deslizar é a mesma caixa animando `transform` e
 *    `width` de um item para o outro. Só esses dois animam, nunca `left`.
 *
 * ⚠️ Antes da primeira medição a pílula não tem posição, e com transição ligada ela
 *    entraria voando do canto esquerdo no carregamento. Por isso a transição só liga
 *    depois que a primeira posição foi aplicada.
 *
 * 🔴 `aria-current` é a fonte da verdade: a pílula é só desenho, escondida de leitor de tela.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface Item {
  readonly label: string;
  readonly href: string;
}

interface Posicao {
  readonly x: number;
  readonly largura: number;
}

function estaAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavPill({ items }: { readonly items: readonly Item[] }) {
  const pathname = usePathname();
  const indiceAtivo = items.findIndex((i) => estaAtivo(pathname, i.href));

  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [animar, setAnimar] = useState(false);

  const medir = useCallback(() => {
    const el = indiceAtivo >= 0 ? refs.current[indiceAtivo] : null;
    setPosicao(el ? { x: el.offsetLeft, largura: el.offsetWidth } : null);
  }, [indiceAtivo]);

  useLayoutEffect(() => {
    medir();
  }, [medir]);

  // A largura dos itens muda quando a Sora termina de carregar e quando a janela cruza
  // um breakpoint. Sem observar, a pílula fica com a largura medida na fonte de fallback.
  useLayoutEffect(() => {
    const trilho = refs.current[0]?.parentElement;
    if (!trilho) return;
    const observador = new ResizeObserver(medir);
    observador.observe(trilho);
    return () => observador.disconnect();
  }, [medir]);

  useLayoutEffect(() => {
    if (posicao && !animar) {
      const quadro = requestAnimationFrame(() => setAnimar(true));
      return () => cancelAnimationFrame(quadro);
    }
  }, [posicao, animar]);

  return (
    <nav
      aria-label="Main"
      className="relative hidden items-center rounded-button border border-border bg-surface p-1 md:flex"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1 bottom-1 left-0 rounded-button bg-primary",
          animar &&
            "transition-[transform,width,opacity] duration-[var(--duracao-transicao)] ease-[var(--curva-suave)] motion-reduce:transition-none",
        )}
        style={{
          width: posicao?.largura ?? 0,
          transform: `translateX(${posicao?.x ?? 0}px)`,
          opacity: posicao ? 1 : 0,
        }}
      />
      {items.map((item, i) => {
        const ativo = i === indiceAtivo;
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "relative z-10 rounded-button px-4 py-1.5 text-sm transition-colors lg:px-5",
              "duration-[var(--duracao-transicao)] ease-[var(--curva-suave)]",
              ativo ? "font-medium text-on-primary" : "text-muted hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
