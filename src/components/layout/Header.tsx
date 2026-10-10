import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { NavPill } from "@/components/layout/NavPill";
import { nav, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-base font-semibold tracking-tight"
            aria-label={`${site.name} — home`}
          >
            {site.name}
          </Link>

          <NavPill items={nav} />

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted lg:inline">
              Available worldwide · Invoicing in USD
            </span>
            <Button href="/call" size="sm">
              Book a call
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
