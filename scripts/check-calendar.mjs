#!/usr/bin/env node
/**
 * Diagnostica a integração com o Google Calendar.
 * Uso: node --env-file=.env.local scripts/check-calendar.mjs
 */
import { createSign } from "node:crypto";

const ok   = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad  = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[36m·\x1b[0m ${m}`);

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey  = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
const subject     = process.env.GOOGLE_IMPERSONATE_SUBJECT;
const calendarId  = process.env.GOOGLE_CALENDAR_ID;
const availId     = process.env.GOOGLE_AVAILABILITY_CALENDAR_ID;
const SCOPE = "https://www.googleapis.com/auth/calendar";

console.log("\n0. Variáveis");
subject    ? ok(`GOOGLE_IMPERSONATE_SUBJECT = ${subject}`) : bad("GOOGLE_IMPERSONATE_SUBJECT ausente — sem isto a delegação não acontece");
calendarId ? ok(`GOOGLE_CALENDAR_ID = ${calendarId}`)      : bad("GOOGLE_CALENDAR_ID ausente");
if (!subject || !calendarId) { console.log(""); process.exit(1); }

console.log("\n1. Token com delegação (impersonation)");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({
  iss: clientEmail, sub: subject, scope: SCOPE,
  aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
});
const sig = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");

const tRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${unsigned}.${sig}`,
  }),
});
const tBody = await tRes.json();

if (!tRes.ok) {
  bad(`${tBody.error}: ${tBody.error_description}`);
  if (tBody.error === "unauthorized_client") {
    console.log("\n   → A delegação não está autorizada para este Client ID + escopo.");
    console.log("     Confira no Admin Console → Segurança → Controles de API →");
    console.log("     Delegação em todo o domínio:");
    console.log("      a) o Client ID é o ID EXCLUSIVO (numérico) da service account,");
    console.log("         não o e-mail e não o project id");
    console.log(`      b) o escopo é exatamente: ${SCOPE}`);
    console.log("      c) pode levar alguns minutos para propagar");
  } else if (String(tBody.error_description).includes("Invalid email")) {
    console.log(`\n   → "${subject}" não existe neste Workspace.`);
  }
  console.log(""); process.exit(1);
}
ok("token obtido — delegação funcionando");
const token = tBody.access_token;

console.log("\n2. Acesso à agenda");
const cRes = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const cBody = await cRes.json();
if (!cRes.ok) {
  bad(`${cRes.status} ${cBody?.error?.message}`);
  if (cRes.status === 404) console.log(`\n   → Agenda "${calendarId}" não encontrada para ${subject}.`);
  console.log(""); process.exit(1);
}
ok(`agenda acessível: "${cBody.summary}" (${cBody.timeZone})`);

console.log("\n3. freeBusy");
const fRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 21 * 86400000).toISOString(),
    items: [{ id: calendarId }],
  }),
});
const fBody = await fRes.json();
if (!fRes.ok) { bad(`${fRes.status} ${JSON.stringify(fBody).slice(0,200)}`); console.log(""); process.exit(1); }

const cal = fBody?.calendars?.[calendarId];
if (cal?.errors?.length) { bad(`erro no calendário: ${JSON.stringify(cal.errors)}`); console.log(""); process.exit(1); }

ok(`freeBusy respondeu — ${cal?.busy?.length ?? 0} blocos ocupados nos próximos 21 dias`);

console.log("\n4. Agenda de disponibilidade (janelas abertas)");
if (!availId) {
  info("GOOGLE_AVAILABILITY_CALENDAR_ID não definida");
  info("→ o site vai cair no fallback de horário comercial, que numa agenda cheia retorna zero");
} else {
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 21 * 86400000).toISOString(),
    singleEvents: "true", orderBy: "startTime", maxResults: "250",
  });
  const eRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(availId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const eBody = await eRes.json();
  if (!eRes.ok) {
    bad(`${eRes.status} ${eBody?.error?.message}`);
    if (eRes.status === 404) console.log(`\n   → Agenda "${availId}" não encontrada. Confira o ID.`);
  } else {
    const items = (eBody.items ?? []).filter((e) => e.status !== "cancelled" && e.start?.dateTime);
    if (!items.length) {
      bad("nenhuma janela encontrada nos próximos 21 dias");
      console.log("\n   → Crie eventos nesta agenda marcando quando você aceita intro calls.");
      console.log("     Dica: um evento recorrente semanal resolve de uma vez.");
    } else {
      ok(`${items.length} janelas abertas encontradas`);
      const fmt = (iso) => new Date(iso).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit",
        month: "2-digit", hour: "2-digit", minute: "2-digit",
      });
      for (const e of items.slice(0, 5)) {
        info(`${fmt(e.start.dateTime)} → ${fmt(e.end.dateTime)}  ${e.summary ?? ""}`);
      }
    }
  }
}
console.log("\n\x1b[32mIntegração do calendário OK.\x1b[0m\n");
