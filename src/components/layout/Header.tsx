import Image from "next/image";
import Link from "next/link";
import { NavPill } from "@/components/layout/NavPill";
import { headerNav } from "@/lib/site";

/**
 * Header como UMA pílula preta flutuando no centro: logo, menu e o "Book a call"
 * dentro do mesmo trilho. Referência: o menu do recent.co, no preto do PORTINARI.
 *
 * ⚠️ O header em si é transparente e só a pílula tem fundo. Por isso o
 *    `pointer-events-none` no header e o `auto` na pílula: sem isso a faixa
 *    vazia dos lados engoliria o clique no conteúdo que rola por baixo.
 *
 * 🔴 O foco global é contorno `inverted` — quase preto, invisível sobre esta
 *    pílula. Quem troca para o lima é a regra `.bg-inverted :focus-visible`
 *    do globals.css, não utilitário aqui (ver o porquê lá).
 */
export function Header() {
  return (
    <header className="pointer-events-none sticky top-0 z-50 flex justify-center px-4 pt-3">
      <div className="pointer-events-auto flex items-center gap-1 rounded-button bg-inverted p-1.5 shadow-lg shadow-black/10">
        <Link
          href="/"
          aria-label="Caáju — home"
          className="flex h-9 items-center rounded-button px-3"
        >
          <Image
            src="/brand/caaju-logo-branco.webp"
            alt=""
            width={234}
            height={96}
            priority
            className="h-5 w-auto"
          />
        </Link>

        <NavPill items={headerNav} />

        <Link
          href="/call"
          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-button bg-on-inverted px-4 text-xs font-medium text-inverted transition-opacity duration-200 hover:opacity-90"
        >
          Book a call
        </Link>
      </div>
    </header>
  );
}
