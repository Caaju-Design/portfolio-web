import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, SESSION_MAX_AGE_MS, adminAuth } from "@/lib/firebase/admin";
import { logAccess } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * POST /api/access/session
 * Troca o ID token (obtido no client após o magic link) por um session
 * cookie HttpOnly, e concede a claim de acesso ao case solicitado.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  let idToken: string | undefined;
  let caseSlug: string | undefined;
  try {
    ({ idToken, caseSlug } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!idToken || !caseSlug) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const auth = adminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    // Token recém-emitido: o login precisa ter ocorrido nos últimos 5 minutos.
    const ageMs = Date.now() - decoded.auth_time * 1000;
    if (ageMs > 5 * 60 * 1000) {
      return NextResponse.json({ ok: false, message: "Link expired." }, { status: 401 });
    }

    const existing = (decoded.caseAccess as string[] | undefined) ?? [];
    const caseAccess = Array.from(new Set([...existing, caseSlug]));
    await auth.setCustomUserClaims(decoded.uid, { caseAccess });

    // Reemite o token para carregar a claim nova antes de criar o cookie.
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    await logAccess({
      action: "granted",
      email: decoded.email ?? "unknown",
      uid: decoded.uid,
      caseSlug,
      ip,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[access/session] verificação falhou", error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
