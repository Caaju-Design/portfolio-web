import { Hero } from "@/components/sections/Hero";
import { ProofBar } from "@/components/sections/ProofBar";
import { Problem } from "@/components/sections/Problem";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCta } from "@/components/sections/FinalCta";

/**
 * Ordem das seções = sequência de vendas (ver sitemap.md §3).
 * Não reordenar sem motivo comercial.
 * Pendentes: Selected work, How engagements work, About teaser, Writing teaser.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofBar />
      <Problem />
      <Services />
      <Testimonials />
      <FinalCta />
    </>
  );
}
