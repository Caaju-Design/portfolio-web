import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Botão do portfólio.
 *
 * ⚠️ ESPELHA `Botao` do @caaju-design/caaju-ui-react — não o embrulha, e a
 *    escolha tem motivo. O componente do pacote é CSS Modules; sobrepor a
 *    ele com utilitário Tailwind depende de qual folha sai por último no
 *    bundle, e a que perde a disputa de mesma especificidade não dá erro:
 *    o estilo simplesmente não acontece. É o defeito do `className`
 *    descartado que o próprio `Botao.tsx` documenta, numa variante pior —
 *    porque dependeria da ordem do empacotador, e não do código.
 *
 * ⛔ As DECISÕES vêm do sistema e não se negocia nenhuma:
 *      - pílula (`--raio-pilula`), não retângulo arredondado
 *      - `destaque` é preenchimento lima com texto ESCURO em cima. Texto
 *        claro sobre #e3ff00 mede 1,13:1 — medição do `Botao.module.css`
 *      - sem sombra colorida e sem deslocar no hover: as referências são
 *        chapadas, e brilho lima em fundo claro vira borrão amarelo
 *
 * 💡 O que é DAQUI é só o tamanho: `size` não existe no sistema, que é de
 *    aplicação e tem um botão só. Herói de marketing precisa de um botão
 *    maior que o de uma barra de ferramentas. Candidato a voltar para o
 *    sistema depois de provar uso (P145) — extraído, não inventado.
 */
type Variant = "primary" | "strong" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-(--radius-button) font-medium " +
  "border border-transparent whitespace-nowrap transition-colors duration-200 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  /** A ação principal. Preenchimento do tema, conteúdo escuro — os três temas exigem. */
  primary: "bg-primary text-on-primary hover:brightness-95",
  /** O botão de alto contraste das referências: quase preto no claro. */
  strong: "bg-inverted text-on-inverted hover:opacity-90",
  secondary: "border-border bg-surface text-text hover:bg-surface-alt",
  ghost: "text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

type Props = {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}: Props) {
  /** `className` de quem chama vem por ÚLTIMO, para poder sobrepor. */
  const classes = cn(base, variants[variant], sizes[size], className);

  /**
   * ⛔ Ação que navega é `<a>`, não `<button onClick>`. Botão com `router.push`
   *    quebra abrir em nova aba, copiar o endereço e o clique do meio — e não
   *    dá erro nenhum, o que faz o defeito viver anos. Mesma regra do `Botao`.
   */
  if (href) {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
