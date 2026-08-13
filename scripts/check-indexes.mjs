#!/usr/bin/env node
/**
 * Verificação pós-deploy das isenções de índice e das políticas de TTL.
 *
 * Uso: node --env-file=.env.local scripts/check-indexes.mjs
 *
 * Duas perguntas, e as duas importam:
 *
 *   1. As queries de produção ainda funcionam? Isenção de índice mal feita
 *      não quebra build nem teste — quebra a página, em produção, calado.
 *
 *   2. As isenções pegaram de fato? Aqui o teste é invertido: uma query num
 *      campo que deveria estar SEM índice tem que FALHAR. Se ela passar, a
 *      isenção não foi aplicada e o índice continua sendo pago.
 *
 * Só lê. Não grava nada.
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[36m·\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

let failures = 0;
const fail = (m) => { failures += 1; bad(m); };

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

console.log(`\nProjeto: ${process.env.FIREBASE_PROJECT_ID}\n`);

// ---------- 1. As queries que o site realmente executa ----------
console.log("1. Queries de produção");

const PROD_QUERIES = [
  { nome: "cases · where(status == published)   [lib/cases.ts]",
    run: () => db.collection("cases").where("status", "==", "published").get() },
  { nome: "leads · orderBy(lastSeenAt desc) 200 [lib/insights.ts]",
    run: () => db.collection("leads").orderBy("lastSeenAt", "desc").limit(200).get() },
  { nome: "accessLogs · orderBy(timestamp desc) 500 [lib/insights.ts]",
    run: () => db.collection("accessLogs").orderBy("timestamp", "desc").limit(500).get() },
  { nome: "rateLimits · get por ID              [lib/rate-limit.ts]",
    run: () => db.collection("rateLimits").doc("probe-check-indexes").get() },
];

let construindo = 0;

for (const q of PROD_QUERIES) {
  const t0 = Date.now();
  try {
    const snap = await q.run();
    const n = snap.size ?? (snap.exists ? 1 : 0);
    ok(`${q.nome} — ${n} doc(s), ${Date.now() - t0}ms`);
  } catch (e) {
    const msg = e.message ?? "";
    // "not ready yet" = índice em reconstrução. Passa sozinho.
    // Qualquer outra falha de índice = isenção comeu algo que a query precisa.
    if (/not ready yet|currently building/i.test(msg)) {
      construindo += 1;
      warn(`${q.nome} — índice RECONSTRUINDO (transitório; rode de novo em alguns minutos)`);
    } else {
      fail(`${q.nome} — QUEBROU: ${msg.split("\n")[0]}`);
    }
  }
}

if (construindo > 0) {
  console.log("");
  warn(
    `${construindo} índice(s) ainda reconstruindo.\n` +
      `    Reabilitar campo depois de uma isenção com '*' faz o Firestore varrer\n` +
      `    a coleção do zero. Enquanto isso, a query falha — inclusive em produção.\n` +
      `    Acompanhe em: console.firebase.google.com → Firestore → Índices → Exceções`,
  );
}

// ---------- 2. Teste invertido: o que deveria estar sem índice ----------
console.log("\n2. Isenções (aqui a falha é o resultado esperado)");

const SHOULD_FAIL = [
  { colecao: "accessLogs", campo: "ip", valor: "203.0.113.1" },
  { colecao: "accessLogs", campo: "userAgent", valor: "probe" },
  { colecao: "leads", campo: "company", valor: "probe" },
  { colecao: "rateLimits", campo: "count", valor: 1 },
];

for (const { colecao, campo, valor } of SHOULD_FAIL) {
  try {
    await db.collection(colecao).where(campo, "==", valor).limit(1).get();
    fail(`${colecao}.${campo} — AINDA INDEXADO (a query passou; a isenção não pegou)`);
  } catch (e) {
    const semIndice = e.code === 9 || /index/i.test(e.message ?? "");
    if (semIndice) ok(`${colecao}.${campo} — sem índice, como planejado`);
    else fail(`${colecao}.${campo} — erro inesperado: ${e.message?.split("\n")[0]}`);
  }
}

// ---------- 3. Cobertura do campo de TTL ----------
console.log("\n3. Cobertura do campo de TTL");

const TTL_FIELD = { accessLogs: "deleteAfter", leads: "deleteAfter", rateLimits: "expiresAt" };

for (const [colecao, campo] of Object.entries(TTL_FIELD)) {
  let cursor = null, total = 0, faltando = 0;
  for (;;) {
    let q = db.collection(colecao).orderBy("__name__").limit(300);
    if (cursor) q = q.startAfter(cursor);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) {
      total += 1;
      if (!d.data()[campo]) faltando += 1;
    }
    cursor = snap.docs.at(-1);
    if (snap.size < 300) break;
  }
  if (total === 0) info(`${colecao} — coleção vazia`);
  else if (faltando === 0) ok(`${colecao} — ${total} doc(s), todos com '${campo}'`);
  else fail(`${colecao} — ${faltando} de ${total} SEM '${campo}' (vivem para sempre; rode backfill-ttl)`);
}

// ---------- 4. Vencidos ainda de pé ----------
console.log("\n4. Documentos vencidos aguardando coleta");

const agora = new Date();
for (const [colecao, campo] of Object.entries(TTL_FIELD)) {
  try {
    const snap = await db.collection(colecao).where(campo, "<=", agora).limit(50).get();
    if (snap.empty) ok(`${colecao} — nada vencido pendente`);
    else info(`${colecao} — ${snap.size}+ vencido(s); o TTL recolhe em até 24h`);
  } catch {
    // Esperado: o campo de TTL é isento de índice de propósito, então
    // não dá para consultá-lo por range. Não é erro — é o desenho.
    info(`${colecao} — não consultável por range (campo de TTL sem índice, como planejado)`);
  }
}

console.log("\n———");
if (failures === 0 && construindo > 0) {
  warn("nada quebrado, mas ainda tem índice reconstruindo — rode de novo depois\n");
  process.exitCode = 1;
} else if (failures === 0) {
  ok("tudo conforme o planejado\n");
} else {
  bad(`${failures} verificação(ões) falharam — ver acima\n`);
  process.exitCode = 1;
}
