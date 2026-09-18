import { cn } from "@/lib/cn";

/**
 * Espelha `Cartao` do Design System.
 *
 * 🔴 A BORDA SAIU, e não foi descuido. O `Cartao.tsx` do sistema documenta:
 *    *"A profundidade vem do contraste entre fundo e superfície, não da
 *    sombra."* No tema escuro o cartão precisava de borda porque fundo e
 *    superfície eram quase o mesmo tom. No claro, `--cor-fundo` (#f4f4f5)
 *    contra `--cor-superficie` (#ffffff) já separa — e `--sombra-cartao`
 *    só assenta. Borda somada a isso é o atalho de quem não tem os dois tons.
 */
export function Card({
  children,
  className,
  tone = "normal",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** `inverted` é o cartão escuro; `primary` é o da cor do tema. */
  tone?: "normal" | "inverted" | "primary";
  interactive?: boolean;
}) {
  const tones = {
    normal: "bg-surface shadow-(--sombra-cartao)",
    inverted: "bg-inverted text-on-inverted",
    primary: "bg-primary text-on-primary",
  } as const;

  return (
    <div
      className={cn(
        "rounded-(--radius-card) p-6 md:p-8",
        tones[tone],
        /**
         * ⚠️ Hover muda a SUPERFÍCIE, não a borda. Sem borda não há o que
         *    tingir, e deslocar o cartão no eixo Y é linguagem de card
         *    flutuante — o oposto do chapado das referências.
         */
        interactive && "transition-colors duration-200 hover:bg-surface-alt",
        className,
      )}
    >
      {children}
    </div>
  );
}
