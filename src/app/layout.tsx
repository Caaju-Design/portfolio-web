import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";
/**
 * 🔴 A ORDEM DOS DOIS IMPORTS IMPORTA, e o sintoma de invertê-los é mudo.
 *
 * O tokens.css do Design System declara as `--cor-*` no `:root`. O
 * globals.css TRADUZ essas variáveis para os nomes do Tailwind. Sem o
 * primeiro, todo `var(--cor-…)` do segundo fica sem valor e a página
 * renderiza sem cor nenhuma — sem erro no console, sem aviso no build.
 */
import "@caaju-design/caaju-ui-react/tokens.css";
import "./globals.css";

/**
 * ⚠️ O NOME `--fonte-sora` É CONTRATO com o Design System, não escolha.
 *
 * O `plataforma.tokens.json` do PORTINARI declara
 * `--fonte-interface: var(--fonte-sora), Sora, system-ui, …`. Esta linha
 * é o outro lado: o next/font baixa a Sora no build, hospeda no nosso
 * domínio e preenche a variável.
 *
 * ⛔ Renomear de um lado só NÃO QUEBRA O BUILD. O CSS cai para o `Sora`
 *    literal — que não existe como família instalada, porque o next/font
 *    hospeda sob nome gerado — e daí para `system-ui`. O site inteiro
 *    muda de fonte em silêncio. O README do caaju-ui avisa dos dois lados.
 *
 * A Inter saiu: o sistema usa Sora nos seis tokens de texto, e manter uma
 * segunda família seria a primeira divergência.
 */
const sora = Sora({ subsets: ["latin"], variable: "--fonte-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: site.email,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location.city,
    addressCountry: site.location.country,
  },
  sameAs: [site.social.linkedin],
  worksFor: { "@type": "Organization", name: site.legalEntity },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale} data-tema="lima" className={sora.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
