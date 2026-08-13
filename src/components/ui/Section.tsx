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

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2 text-balance">{title}</h2>
      {description && (
        <p className="mt-4 text-lead text-muted text-pretty">{description}</p>
      )}
    </header>
  );
}
