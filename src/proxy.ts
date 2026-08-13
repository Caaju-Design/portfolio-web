import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/firebase/admin.constants";

/**
 * proxy.ts — antigo middleware.ts (renomeado no Next.js 16).
 *
 * ESTE ARQUIVO NÃO É A AUTORIDADE DE SEGURANÇA.
 *
 * Ele roda no Edge, onde o firebase-admin não funciona (depende de
 * `crypto` e `os` do Node). Aqui fazemos apenas a checagem barata:
 * "existe um cookie de sessão?". Se não existe, redireciona para o gate
 * antes de gastar servidor.
 *
 * A verificação criptográfica de verdade — assinatura, expiração e
 * revogação — acontece no Server Component, com o Admin SDK, ANTES de
 * qualquer conteúdo ser buscado. Um cookie forjado passa por aqui e
 * morre lá, com 404. Nada vaza.
 *
 * Ver docs/security-architecture.md §5 e §6.
 */

const PROTECTED = [/^\/work\/[^/]+\/deep$/, /^\/client(\/|$)/];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/access";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, noarchive, nosnippet, noimageindex");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: ["/work/:slug/deep", "/client/:path*"],
};
