import "server-only";
import { adminDb } from "@/lib/firebase/admin";
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

export async function getCase(slug: string): Promise<CaseSummary | null> {
  const snap = await adminDb().collection("cases").doc(slug).get();
  const data = snap.data();
  if (!data || data.status !== "published") return null;
  return data as CaseSummary;
}
