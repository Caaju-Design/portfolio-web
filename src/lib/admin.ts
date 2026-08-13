import "server-only";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { SESSION_COOKIE, adminAuth } from "@/lib/firebase/admin";

/**
 * Autorização de administrador.
 *
 * O e-mail vem do session cookie do Firebase — já verificado criptograficamente,
 * incluindo revogação. A allowlist é por variável de ambiente: não há tela de
 * gestão de usuários porque não há usuários a gerir, e cada tela dessas é
 * superfície de ataque a mais.
 *
 * Falha com notFound(), nunca 403 — não confirma que a rota existe.
 */
export async function requireAdmin(): Promise<{ uid: string; email: string }> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) notFound();

  let decoded;
  try {
    decoded = await adminAuth().verifySessionCookie(session, true);
  } catch {
    notFound();
  }

  const email = decoded.email?.toLowerCase();
  if (!email) notFound();

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowlist.includes(email)) notFound();

  return { uid: decoded.uid, email };
}
