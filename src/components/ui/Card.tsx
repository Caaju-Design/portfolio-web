import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-(--radius-card) border border-border bg-surface p-6 md:p-8",
        interactive &&
          "transition-all duration-300 ease-(--ease-out-expo) hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-alt",
        className,
      )}
    >
      {children}
    </div>
  );
}
