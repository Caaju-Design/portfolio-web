import "server-only";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Rate limit por janela fixa, persistido no Firestore.
 * Suficiente para o volume deste site. Se um dia virar gargalo,
 * trocar por Redis/Upstash sem mudar a assinatura.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const id = `${Buffer.from(key).toString("base64url")}_${bucket}`;
  const ref = adminDb().collection("rateLimits").doc(id);

  try {
    return await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = (snap.data()?.count as number | undefined) ?? 0;

      if (count >= limit) return { allowed: false, remaining: 0 };

      tx.set(
        ref,
        { count: count + 1, key, expiresAt: new Date((bucket + 1) * windowMs) },
        { merge: true },
      );
      return { allowed: true, remaining: limit - count - 1 };
    });
  } catch (error) {
    // Fail closed: se o rate limit não pôde ser avaliado, nega.
    console.error("[rate-limit] falha na transação", error);
    return { allowed: false, remaining: 0 };
  }
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "throwawaymail.com", "yopmail.com", "trashmail.com", "sharklasers.com",
  "getnada.com", "temp-mail.org", "fakeinbox.com", "maildrop.cc",
  "dispostable.com", "mintemail.com", "spamgourmet.com",
]);

const FREE_DOMAINS = new Set([
  "gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com",
  "proton.me", "protonmail.com", "live.com", "aol.com", "gmx.com",
]);

export type EmailVerdict = "corporate" | "free" | "disposable" | "invalid";

export function classifyEmail(email: string): EmailVerdict {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) return "invalid";

  const domain = normalized.split("@")[1];
  if (DISPOSABLE_DOMAINS.has(domain)) return "disposable";
  if (FREE_DOMAINS.has(domain)) return "free";
  return "corporate";
}
