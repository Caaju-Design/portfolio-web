import Image from "next/image";
import Link from "next/link";
import { HeaderAutoHide } from "@/components/layout/HeaderAutoHide";
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
 *
 * 💡 Some ao rolar para baixo e volta ao rolar para cima — ver `HeaderAutoHide`.
 *    O Header continua componente de servidor; só o invólucro é de cliente.
 */
export function Header() {
  return (
    <HeaderAutoHide>
      <div className="pointer-events-auto flex items-center gap-1 rounded-button bg-inverted p-1.5 shadow-lg shadow-black/10">
        <Link
          href="/"
          aria-label="Caáju — home"
          className="mr-2 flex h-9 items-center rounded-button pl-4 pr-3 md:mr-6"
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
          className="ml-2 inline-flex h-9 items-center justify-center whitespace-nowrap rounded-button bg-on-inverted px-5 text-xs font-medium text-inverted transition-opacity duration-200 hover:opacity-90 md:ml-6"
        >
          Book a call
        </Link>
      </div>
    </HeaderAutoHide>
  );
}
