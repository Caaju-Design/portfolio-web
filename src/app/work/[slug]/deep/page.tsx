import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { SESSION_COOKIE, adminAuth, adminDb } from "@/lib/firebase/admin";
import { logAccess } from "@/lib/audit";
import { Section } from "@/components/ui/Section";

/**
 * A AUTORIDADE DE SEGURANÇA MORA AQUI.
 *
 * O proxy.ts só checou se existe um cookie. Aqui verificamos assinatura,
 * expiração e revogação com o Admin SDK, conferimos a claim do case, e
 * SÓ ENTÃO buscamos o conteúdo. Nada restrito é lido do banco antes disso.
 *
 * Retornamos notFound() em vez de 403 de propósito: 403 confirmaria que o
 * case existe, permitindo enumeração. 404 não confirma nada.
 *
 * Exceção deliberada: visitante já autenticado que pede um case ainda não
 * liberado é redirecionado ao gate, não 404. Ele já provou o e-mail, e a
 * existência do case já é pública em /work. Ver o comentário abaixo.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // jamais estático, jamais cacheado

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function DeepCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) notFound();

  let decoded;
  try {
    decoded = await adminAuth().verifySessionCookie(session, true); // true = checa revogação
  } catch {
    notFound();
  }

  // A concessao mora no Firestore, nao no token — ver a rota /api/access/session.
  // Custo: uma leitura por documento, por ID, sem query e sem indice.
  const userSnap = await adminDb().collection("clientUsers").doc(decoded.uid).get();
  const allowed = (userSnap.data()?.caseAccess as string[] | undefined) ?? [];

  if (!allowed.includes(slug)) {
    // Visitante AUTENTICADO pedindo um case que ele ainda nao liberou.
    //
    // Aqui 404 protegeria nada e custaria caro: /work lista os tres cases
    // publicamente, com selo "Client access". A existencia deste case ja e
    // publica. Devolver "This page doesn't exist" para quem ja entregou o
    // e-mail e passou pela verificacao faz o lead concluir que o site quebrou.
    //
    // Para quem NAO tem sessao, o 404 continua — e o proxy nem chega aqui.
    redirect(`/access?next=/work/${slug}/deep`);
  }

  const snap = await adminDb().collection("cases").doc(slug).get();
  const data = snap.data();
  if (!data || data.deepAccess === "open") notFound();

  await logAccess({
    action: "viewed",
    email: decoded.email ?? "unknown",
    uid: decoded.uid,
    caseSlug: slug,
  });

  const viewer = decoded.email ?? "";

  return (
    <div className="relative">
      {/* Watermark nominal. Não impede print — faz o print carregar o nome
          de quem vazou. Controle de dissuasão, não de prevenção. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.045]"
      >
        <div className="flex h-full w-full flex-wrap content-start gap-x-16 gap-y-24 p-10 text-xs -rotate-12">
          {Array.from({ length: 120 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap">
              {viewer} · {new Date().toISOString().slice(0, 10)}
            </span>
          ))}
        </div>
      </div>

      <Section spacing="loose">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Confidential · {viewer}
        </p>
        <h1 className="mt-4 text-h1">{data.title as string}</h1>
        <p className="mt-5 max-w-2xl text-lead text-muted text-pretty">
          {data.headline as string}
        </p>

        <div className="mt-16 space-y-10">
          {/* Renderização dos deepBlocks entra aqui, em Server Component.
              O conteúdo NUNCA é passado como prop para Client Component. */}
          <p className="text-muted">
            Deep content blocks render here once the Firestore seed is in place.
          </p>
        </div>

        <p className="mt-20 border-t border-border pt-8 text-xs text-subtle">
          This material is shared under NDA. Your access was logged on{" "}
          {new Date().toLocaleDateString("en-GB")}. Please do not redistribute.
        </p>
      </Section>
    </div>
  );
}
