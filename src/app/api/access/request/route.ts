import { NextResponse, type NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";
import { logAccess, upsertLead } from "@/lib/audit";
import { checkRateLimit, classifyEmail } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/**
 * POST /api/access/request
 *
 * Gera o link mágico NO SERVIDOR (generateSignInWithEmailLink) e o envia
 * ao n8n, que dispara o e-mail. Isso mantém controle total do fluxo:
 * rate limit, classificação de e-mail e captura de lead acontecem antes
 * de qualquer link existir.
 *
 * Resposta sempre genérica — não confirma se o e-mail existe nem se o
 * case existe. Enumeração é vetor de reconhecimento.
 */

const GENERIC_OK = { ok: true as const, message: "If everything checks out, the link is on its way." };

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  let body: { email?: string; company?: string; jobTitle?: string; caseSlug?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: campo invisível no formulário. Bot preenche, humano não.
  if (body.website) {
    return NextResponse.json(GENERIC_OK);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const caseSlug = body.caseSlug?.trim() ?? "";

  if (!email || !caseSlug) {
    return NextResponse.json({ ok: false, message: "Missing fields." }, { status: 400 });
  }

  const verdict = classifyEmail(email);
  if (verdict === "invalid" || verdict === "disposable") {
    await logAccess({ action: "denied", email, caseSlug, ip, userAgent, reason: verdict });
    return NextResponse.json(GENERIC_OK);
  }

  const byIp = await checkRateLimit(`ip:${ip}`, 10, 60 * 60 * 1000);
  const byEmail = await checkRateLimit(`email:${email}`, 3, 60 * 60 * 1000);
  if (!byIp.allowed || !byEmail.allowed) {
    await logAccess({ action: "denied", email, caseSlug, ip, userAgent, reason: "rate-limited" });
    return NextResponse.json(GENERIC_OK);
  }

  try {
    await upsertLead({ email, company: body.company, jobTitle: body.jobTitle, caseSlug, ip, userAgent });

    const link = await adminAuth().generateSignInWithEmailLink(email, {
      url: `${site.url}/access/verify?case=${encodeURIComponent(caseSlug)}`,
      handleCodeInApp: true,
    });

    await dispatchMagicLinkEmail({ email, link, caseSlug });
    await logAccess({ action: "requested", email, caseSlug, ip, userAgent });
  } catch (error) {
    console.error("[access/request] falhou", error);
    // Resposta genérica mesmo em erro — não expõe estado interno.
  }

  return NextResponse.json(GENERIC_OK);
}

/** O n8n envia o e-mail. A aplicação não depende de provedor de e-mail. */
async function dispatchMagicLinkEmail(payload: { email: string; link: string; caseSlug: string }) {
  const url = process.env.N8N_MAGIC_LINK_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!url || !secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[access/request] n8n não configurado. Link de dev:\n", payload.link);
      return;
    }
    throw new Error("N8N_MAGIC_LINK_WEBHOOK_URL não configurado");
  }

  const { createHmac } = await import("node:crypto");
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Caaju-Signature": `sha256=${signature}` },
    body,
    signal: AbortSignal.timeout(8000),
  });
}
