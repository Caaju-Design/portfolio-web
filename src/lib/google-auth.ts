import "server-only";
import { createSign } from "node:crypto";

/**
 * Access token do Google via JWT bearer, assinado com a service account.
 *
 * Feito na mão de propósito: a lib `googleapis` traz megabytes de código
 * para usarmos dois endpoints. Aqui são ~40 linhas e zero dependência nova.
 */

const cache = new Map<string, { token: string; expiresAt: number }>();

export async function getGoogleAccessToken(scope: string): Promise<string> {
  /**
   * Delegação em todo o domínio (Workspace): a claim `sub` faz a service
   * account agir COMO este usuário. Sem ela, a SA é uma identidade externa
   * e não consegue escrever em agenda de ninguém.
   */
  const subject = process.env.GOOGLE_IMPERSONATE_SUBJECT;
  const cacheKey = `${scope}|${subject ?? ""}`;

  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now() + 60_000) return hit.token;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Service account não configurada");

  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);

  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: clientEmail,
      ...(subject ? { sub: subject } : {}),
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    });

  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (body.includes("unauthorized_client")) {
      throw new Error(
        "unauthorized_client: a delegação em todo o domínio não está autorizada para este " +
        "Client ID e escopo. Confira no Admin Console → Segurança → Controles de API → " +
        "Delegação em todo o domínio. Pode levar alguns minutos para propagar.",
      );
    }
    throw new Error(`Falha ao obter access token: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}
