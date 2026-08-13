import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/** Encerra a sessão e revoga os refresh tokens no Firebase. */
export async function POST() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;

  if (session) {
    try {
      const decoded = await adminAuth().verifySessionCookie(session, true);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // Sessão já inválida — segue e limpa o cookie.
    }
  }

  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
