import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav, nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold">{site.name}</p>
            <p className="mt-3 text-sm text-muted text-pretty">{site.role}</p>
            <p className="mt-4 text-sm text-muted">
              {site.location.city}, {site.location.country} ({site.location.timezone})
              <br />
              {site.overlap}
            </p>
          </div>

          <nav aria-label="Footer primary" className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">Explore</p>
            {nav.map((i) => (
              <Link key={i.href} href={i.href} className="text-sm text-muted hover:text-text">
                {i.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Footer secondary" className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">More</p>
            {footerNav.map((i) => (
              <Link key={i.href} href={i.href} className="text-sm text-muted hover:text-text">
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalEntity}. All rights reserved.
          </p>
          <p>Invoicing in USD · MSA + SOW · NDA on request</p>
        </div>
      </Container>
    </footer>
  );
}
