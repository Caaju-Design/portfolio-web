import type { ReactNode } from "react";

import { FilmeDePrisma } from "./FilmeDePrisma";

/**
 * O palco das portas do /lab: o filme num paper de cantos amplos, e o
 * cartão de vidro no meio. Espelho do `layout.tsx` de `auth/(entrada)` do
 * Juca e do Portinari — os dois usam a mesma moldura. (ADR-030)
 *
 * Saiu do `JucaScreen` quando o Portinari virou a segunda porta (ADR-031):
 * dois palcos escritos à parte divergiriam no primeiro ajuste.
 */
export function PalcoDeEntrada({ children }: { children: ReactNode }) {
  return (
    <div className="entrada-palco min-h-[32rem] md:min-h-[38rem]">
      <FilmeDePrisma />

      <div className="relative z-10 grid w-full place-items-center px-(--espaco-5) py-(--espaco-8)">
        <div className="entrada-vidro">{children}</div>
      </div>
    </div>
  );
}
