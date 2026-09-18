import { cn } from "@/lib/cn";

/**
 * Espelha `Etiqueta` do Design System: pílula com borda, rótulo miúdo.
 *
 * ⛔ O tom `primary` é PREENCHIMENTO lima com texto escuro — nunca texto
 *    lima. Sobre fundo claro o lima como letra mede 1,04:1. A versão
 *    anterior fazia `bg-primary/10 text-primary`, que no tema escuro
 *    funcionava e aqui seria texto invisível dentro de um chip invisível.
 *
 * ⚠️ `tone` é SEMÂNTICA, não cor: quem chama diz o papel, o tema diz a cor.
 *    Por isso trocar o tema não toca em tela nenhuma. Mesma decisão da
 *    `Etiqueta`, que nem prop de cor aceita.
 */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "strong";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-surface text-muted",
    primary: "border-transparent bg-primary text-on-primary",
    strong: "border-transparent bg-inverted text-on-inverted",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
