import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Props = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Espaçamento vertical. 'tight' para blocos encadeados. */
  spacing?: "tight" | "default" | "loose";
  as?: "section" | "div" | "footer" | "header";
};

const spacingMap = {
  tight: "py-16 md:py-20",
  default: "py-20 md:py-28",
  loose: "py-28 md:py-40",
} as const;

export function Section({
  children,
  id,
  className,
  spacing = "default",
  as: Tag = "section",
}: Props) {
  return (
    <Tag id={id} className={cn(spacingMap[spacing], className)}>
      <Container>{children}</Container>
    </Tag>
  );
}

/**
 * O nivel do titulo e semantico, nao visual.
 *
 * Toda pagina precisa de exatamente um <h1>: e a ancora para quem navega por
 * titulos com leitor de tela, e o sinal de relevancia mais forte que a pagina
 * emite para busca. Seis paginas comecavam em <h2> e nao tinham nenhum.
 *
 * O tamanho continua `text-h2` de proposito — mudar a tag nao muda o desenho.
 * Hierarquia semantica e hierarquia visual sao decisoes separadas.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}
      <Heading className="text-h2 text-balance">{title}</Heading>
      {description && (
        <p className="mt-4 text-lead text-muted text-pretty">{description}</p>
      )}
    </header>
  );
}
