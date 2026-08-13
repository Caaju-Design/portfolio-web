import "server-only";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Agregações para o painel.
 *
 * Busca cru e agrega em memória de propósito: o volume é pequeno e isso evita
 * índices compostos no Firestore, que só existiriam para responder perguntas
 * que ainda vamos mudar. Se um dia passar de alguns milhares de registros,
 * migrar para agregação incremental em Cloud Function.
 */

const FREE_DOMAINS = new Set([
  "gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com",
  "proton.me", "protonmail.com", "live.com", "aol.com", "gmx.com",
]);

export type Lead = {
  email: string;
  emailDomain: string;
  company?: string | null;
  jobTitle?: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  requestedCases: string[];
  status: string;
};

export type LogEntry = {
  action: string;
  email: string;
  emailDomain: string;
  caseSlug?: string;
  timestamp: Date;
  reason?: string;
};

export type IntentSignal = {
  email: string;
  domain: string;
  company?: string | null;
  views: number;
  lastSeen: Date;
  reasons: string[];
  score: number;
};

export type Insights = {
  leads: Lead[];
  logs: LogEntry[];
  signals: IntentSignal[];
  funnel: { label: string; value: number; hint?: string }[];
  committees: { domain: string; people: string[] }[];
  denied: LogEntry[];
};

const toDate = (v: unknown): Date =>
  v && typeof v === "object" && "toDate" in (v as object)
    ? (v as { toDate(): Date }).toDate()
    : new Date(v as string | number);

export async function getInsights(): Promise<Insights> {
  const db = adminDb();

  const [leadSnap, logSnap] = await Promise.all([
    db.collection("leads").orderBy("lastSeenAt", "desc").limit(200).get(),
    db.collection("accessLogs").orderBy("timestamp", "desc").limit(500).get(),
  ]);

  const leads: Lead[] = leadSnap.docs.map((d) => {
    const x = d.data();
    return {
      email: x.email,
      emailDomain: x.emailDomain ?? "",
      company: x.company ?? null,
      jobTitle: x.jobTitle ?? null,
      firstSeenAt: toDate(x.firstSeenAt),
      lastSeenAt: toDate(x.lastSeenAt),
      requestedCases: x.requestedCases ?? [],
      status: x.status ?? "requested",
    };
  });

  const logs: LogEntry[] = logSnap.docs.map((d) => {
    const x = d.data();
    return {
      action: x.action ?? "",
      email: x.email ?? "",
      emailDomain: x.emailDomain ?? "",
      caseSlug: x.caseSlug,
      timestamp: toDate(x.timestamp),
      reason: x.reason,
    };
  });

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86_400_000;

  // ---- Sinais de intenção ----
  const byEmail = new Map<string, LogEntry[]>();
  for (const log of logs) {
    if (log.action !== "viewed" && log.action !== "granted") continue;
    const list = byEmail.get(log.email) ?? [];
    list.push(log);
    byEmail.set(log.email, list);
  }

  const signals: IntentSignal[] = [];
  for (const [email, entries] of byEmail) {
    const domain = email.split("@")[1] ?? "";
    const recent = entries.filter((e) => e.timestamp.getTime() > sevenDaysAgo);
    const views = entries.filter((e) => e.action === "viewed").length;
    const lead = leads.find((l) => l.email === email);

    const reasons: string[] = [];
    let score = 0;

    if (recent.length >= 3) { reasons.push(`${recent.length} visits in 7 days`); score += 40; }
    else if (recent.length === 2) { reasons.push("Returned this week"); score += 20; }

    if (domain && !FREE_DOMAINS.has(domain)) { reasons.push("Corporate domain"); score += 20; }

    const sameDomain = [...byEmail.keys()].filter((e) => e.endsWith(`@${domain}`));
    if (domain && !FREE_DOMAINS.has(domain) && sameDomain.length > 1) {
      reasons.push(`${sameDomain.length} people from the same company`);
      score += 30;
    }

    if (lead?.requestedCases?.includes("booking")) { reasons.push("Booked a call"); score += 50; }
    if ((lead?.requestedCases?.length ?? 0) > 1) { reasons.push("Multiple cases"); score += 15; }

    if (!reasons.length) continue;

    signals.push({
      email,
      domain,
      company: lead?.company ?? null,
      views,
      lastSeen: entries[0].timestamp,
      reasons,
      score: Math.min(score, 100),
    });
  }
  signals.sort((a, b) => b.score - a.score);

  // ---- Comitês de compra ----
  const domainMap = new Map<string, Set<string>>();
  for (const email of byEmail.keys()) {
    const domain = email.split("@")[1] ?? "";
    if (!domain || FREE_DOMAINS.has(domain)) continue;
    const set = domainMap.get(domain) ?? new Set();
    set.add(email);
    domainMap.set(domain, set);
  }
  const committees = [...domainMap.entries()]
    .filter(([, set]) => set.size > 1)
    .map(([domain, set]) => ({ domain, people: [...set] }));

  // ---- Funil ----
  const requested = logs.filter((l) => l.action === "requested").length;
  const granted = logs.filter((l) => l.action === "granted").length;
  const viewed = logs.filter((l) => l.action === "viewed").length;
  const booked = leads.filter((l) => l.requestedCases.includes("booking")).length;
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

  const funnel = [
    { label: "Access requested", value: requested },
    { label: "Link verified", value: granted, hint: `${pct(granted, requested)} of requests` },
    { label: "Case viewed", value: viewed, hint: `${pct(viewed, granted)} of grants` },
    { label: "Call booked", value: booked, hint: `${pct(booked, granted)} of grants` },
  ];

  return {
    leads,
    logs,
    signals,
    funnel,
    committees,
    denied: logs.filter((l) => l.action === "denied").slice(0, 20),
  };
}
