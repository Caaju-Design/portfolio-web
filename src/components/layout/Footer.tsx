import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav, nav, site } from "@/lib/site";

export function Footer() {
  /**
   * 🔴 Rodape INVERTIDO. `bg-surface` era branco a 40% sobre cinza claro:
   *    no tema claro isso nao e superficie, e nada. O bloco escuro fecha a
   *    pagina com o contraste das referencias, e sai de
   *    `--cor-superficie-invertida` — token do sistema, nao cor nova.
   *
   * ⚠️ TODO texto aqui dentro usa o par invertido. `--color-muted` foi medido
   *    contra o fundo claro e mede 3,49:1 sobre este bloco: reprova. O
   *    `--color-on-inverted-muted` mede 7,02:1.
   */
  return (
    <footer className="bg-inverted text-on-inverted">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold">{site.name}</p>
            <p className="mt-3 text-sm text-on-inverted-muted text-pretty">{site.role}</p>
            <p className="mt-4 text-sm text-on-inverted-muted">
              {site.location.city}, {site.location.country} ({site.location.timezone})
              <br />
              {site.overlap}
            </p>
          </div>

          <nav aria-label="Footer primary" className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-on-inverted-muted">Explore</p>
            {nav.map((i) => (
              <Link key={i.href} href={i.href} className="text-sm text-on-inverted-muted hover:text-on-inverted">
                {i.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Footer secondary" className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-on-inverted-muted">More</p>
            {footerNav.map((i) => (
              <Link key={i.href} href={i.href} className="text-sm text-on-inverted-muted hover:text-on-inverted">
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/15 py-8 text-xs text-on-inverted-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalEntity}. All rights reserved.
          </p>
          <p>Invoicing in USD · MSA + SOW · NDA on request</p>
        </div>
      </Container>
    </footer>
  );
}
