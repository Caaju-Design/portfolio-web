import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Avatar com iniciais quando não há foto autorizada.
 *
 * Não é placeholder: a cor deriva do nome de forma determinística, então cada
 * pessoa tem sempre o mesmo tom. Lido em conjunto, o grid ganha ritmo de cor
 * e parece intencional — que é o que evita a sensação de imagem faltando.
 *
 * Quando a autorização de uso de imagem chegar, basta preencher `src`.
 */

const PALETTE = [
  { bg: "oklch(0.28 0.06 200)", fg: "oklch(0.88 0.10 200)" },
  { bg: "oklch(0.28 0.06 280)", fg: "oklch(0.88 0.10 280)" },
  { bg: "oklch(0.28 0.06 160)", fg: "oklch(0.88 0.10 160)" },
  { bg: "oklch(0.28 0.06 320)", fg: "oklch(0.88 0.10 320)" },
  { bg: "oklch(0.28 0.06 240)", fg: "oklch(0.88 0.10 240)" },
  { bg: "oklch(0.28 0.06 120)", fg: "oklch(0.88 0.10 120)" },
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 1);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] ?? "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 44,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  const tone = PALETTE[hash(name) % PALETTE.length];

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundColor: tone.bg,
        color: tone.fg,
        fontSize: size * 0.36,
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold tracking-tight",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
