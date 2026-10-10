import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Block } from "@/components/case/Blocks";
import type { SignalData } from "@/components/ui/Signal";

export type CaseSummary = {
  slug: string;
  title: string;
  headline: string;
  client: string;
  industry: string;
  year: number;
  role: string;
  duration: string;
  categories: string[];
  services: string[];
  deepAccess: "open" | "gated" | "private";
  signals: SignalData[];
  seoDescription: string;
};

/** Só cases publicados. Rascunho nunca aparece em índice nem em sitemap. */
export async function listCases(): Promise<CaseSummary[]> {
  const snap = await adminDb()
    .collection("cases")
    .where("status", "==", "published")
    .get();

  return snap.docs
    .map((d) => d.data() as CaseSummary & { order?: number })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export type CaseDetail = CaseSummary & {
  publicBlocks: Block[];
  tools?: string[];
  /** Trabalho que esta no ar e pode ser visitado — a prova e clicar. */
  liveUrl?: string;
};

/**
 * Pagina publica do case. `deepBlocks` sai daqui de proposito: o restrito so
 * e lido em /work/[slug]/deep, depois da sessao verificada. Sem isso, um
 * `{...item}` descuidado num componente cliente vazaria o material sob NDA.
 */
export async function getCase(slug: string): Promise<CaseDetail | null> {
  const snap = await adminDb().collection("cases").doc(slug).get();
  const data = snap.data();
  if (!data || data.status !== "published") return null;
  const { deepBlocks: _deep, ...rest } = data as CaseDetail & { deepBlocks?: unknown };
  void _deep;
  return { ...rest, publicBlocks: rest.publicBlocks ?? [] };
}
