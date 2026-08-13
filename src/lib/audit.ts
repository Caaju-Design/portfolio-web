import "server-only";

import { createHmac } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Audit log + push para o n8n.
 *
 * O fluxo é PUSH, não PULL: nós chamamos o n8n com payload assinado.
 * Assim o n8n nunca precisa de credencial do GCP e pode viver em
 * qualquer lugar (hoje, Hostinger). Ver docs/security-architecture.md §11.
 */

/**
 * Retenções. São os campos que alimentam as políticas de TTL do Firestore
 * (ver firestore.indexes.json → fieldOverrides e docs/adr.md ADR-023).
 *
 * Campo sem política de TTL é só um timestamp decorativo: o documento nunca
 * morre. Mexer num destes números exige mexer no outro lado também.
 */
export const LEAD_RETENTION_MONTHS = 24; // consentimento LGPD/GDPR
export const ACCESS_LOG_RETENTION_MONTHS = 18; // prova de acesso a material sob NDA

export function monthsFromNow(months: number, from: Date = new Date()): Date {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date;
}

export type AccessAction = "requested" | "granted" | "denied" | "viewed";

export type AccessEvent = {
  action: AccessAction;
  email: string;
  caseSlug?: string;
  uid?: string;
  ip?: string;
  userAgent?: string;
  country?: string;
  reason?: string;
};

export async function logAccess(event: AccessEvent): Promise<void> {
  const now = new Date();
  const record = {
    ...event,
    email: event.email.toLowerCase(),
    emailDomain: event.email.toLowerCase().split("@")[1] ?? "",
    timestamp: now,
    processed: false,
    // Campo de TTL. Sem ele o log vive para sempre.
    deleteAfter: monthsFromNow(ACCESS_LOG_RETENTION_MONTHS, now),
  };

  // O log nunca pode derrubar a requisição do usuário.
  try {
    await adminDb().collection("accessLogs").add(record);
  } catch (error) {
    console.error("[audit] falha ao gravar accessLog", error);
  }

  void notifyN8n(record);
}

async function notifyN8n(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    const body = JSON.stringify(payload);
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Caaju-Signature": `sha256=${signature}`,
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error("[audit] webhook n8n falhou", error);
  }
}

/** Registra ou atualiza o lead. Domínio indexado para detectar comitê de compra. */
export async function upsertLead(input: {
  email: string;
  company?: string;
  jobTitle?: string;
  caseSlug: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const email = input.email.toLowerCase();
  const id = Buffer.from(email).toString("base64url");
  const now = new Date();

  const deleteAfter = monthsFromNow(LEAD_RETENTION_MONTHS, now);

  const ref = adminDb().collection("leads").doc(id);
  const snap = await ref.get();

  if (snap.exists) {
    const existing = (snap.data()?.requestedCases as string[] | undefined) ?? [];
    await ref.update({
      lastSeenAt: now,
      requestedCases: Array.from(new Set([...existing, input.caseSlug])),
      ...(input.company && { company: input.company }),
      ...(input.jobTitle && { jobTitle: input.jobTitle }),
    });
    return;
  }

  await ref.set({
    email,
    emailDomain: email.split("@")[1] ?? "",
    company: input.company ?? null,
    jobTitle: input.jobTitle ?? null,
    firstSeenAt: now,
    lastSeenAt: now,
    requestedCases: [input.caseSlug],
    source: "unknown",
    status: "requested",
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    consent: { given: true, at: now, policyVersion: "2026-08" },
    deleteAfter,
  });
}
