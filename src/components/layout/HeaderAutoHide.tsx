"use client";

/**
 * Esconde o header quando a página rola para baixo e traz de volta na primeira
 * rolagem para cima.
 *
 * ⚠️ Os limiares existem por motivo: sem o `LIMIAR` o trackpad, que manda deltas de
 *    1–2px na desaceleração, faz o menu piscar; sem o `TOPO` ele some antes do
 *    visitante sair do herói, e no topo da página menu escondido é só sumiço.
 *
 * 🔴 Quem navega por teclado não rola: se o foco entra no header escondido, ele
 *    volta. Senão o anel de foco anda num menu que ninguém vê.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const LIMIAR = 6;
const TOPO = 80;

export function HeaderAutoHide({ children }: { readonly children: React.ReactNode }) {
  const [escondido, setEscondido] = useState(false);
  const ultimoY = useRef(0);

  useEffect(() => {
    ultimoY.current = window.scrollY;
    let quadro = 0;

    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        const y = window.scrollY;
        const delta = y - ultimoY.current;
        if (y <= TOPO) setEscondido(false);
        else if (delta > LIMIAR) setEscondido(true);
        else if (delta < -LIMIAR) setEscondido(false);
        else return; // movimento pequeno não atualiza a referência: acumula até passar
        ultimoY.current = y;
      });
    };

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <header
      onFocus={() => setEscondido(false)}
      className={cn(
        "pointer-events-none sticky top-0 z-50 flex justify-center px-4 pt-3",
        "transition-transform duration-[var(--duracao-transicao)] ease-[var(--curva-suave)] motion-reduce:transition-none",
        // -100% leva a caixa inteira (com o pt-3); o extra tira a sombra da pílula da tela.
        escondido && "-translate-y-[calc(100%+1rem)]",
      )}
    >
      {children}
    </header>
  );
}
