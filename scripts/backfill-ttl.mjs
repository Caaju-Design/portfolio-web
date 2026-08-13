#!/usr/bin/env node
/**
 * Backfill do campo de TTL nos documentos que já existem.
 *
 * Por quê: `deleteAfter` passou a ser gravado em `accessLogs` só agora. Os
 * documentos antigos não têm o campo — e documento sem o campo é ignorado
 * pela política de TTL, ou seja, vive para sempre. Este script conserta o
 * passado; o código em src/lib/audit.ts cuida do futuro.
 *
 * Uso:
 *   node --env-file=.env.local scripts/backfill-ttl.mjs          # simulação
 *   node --env-file=.env.local scripts/backfill-ttl.mjs --apply  # grava
 *
 * Roda quantas vezes quiser: só toca em documento que não tem o campo.
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[36m·\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

const APPLY = process.argv.includes("--apply");
const PAGE = 300;

// Precisa bater com src/lib/audit.ts. Se divergir, a retenção mente.
const RETENTION = {
  accessLogs: { months: 18, from: "timestamp" },
  leads: { months: 24, from: "firstSeenAt" },
};

function monthsFrom(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

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

console.log(
  APPLY
    ? "\n\x1b[31mMODO GRAVAÇÃO\x1b[0m — as alterações são permanentes.\n"
    : "\n\x1b[33mSIMULAÇÃO\x1b[0m — nada será gravado. Use --apply para valer.\n",
);

const now = new Date();
let grandTotal = 0;
let grandMissing = 0;
let alreadyExpired = 0;

for (const [collection, { months, from }] of Object.entries(RETENTION)) {
  console.log(`\n${collection} — retenção de ${months} meses a partir de '${from}'`);

  let cursor = null;
  let scanned = 0;
  let missing = 0;
  let written = 0;
  let skippedNoAnchor = 0;

  for (;;) {
    let q = db.collection(collection).orderBy("__name__").limit(PAGE);
    if (cursor) q = q.startAfter(cursor);
    const snap = await q.get();
    if (snap.empty) break;

    let batch = db.batch();
    let batched = 0;

    for (const doc of snap.docs) {
      scanned += 1;
      const data = doc.data();
      if (data.deleteAfter) continue; // idempotente
      missing += 1;

      const anchorRaw = data[from];
      const anchor = anchorRaw?.toDate?.() ?? (anchorRaw instanceof Date ? anchorRaw : null);
      if (!anchor) {
        // Sem âncora não dá para inferir a data. Ancorar em "agora" seria
        // inventar retenção; melhor listar e decidir na mão.
        skippedNoAnchor += 1;
        warn(`${doc.id}: sem campo '${from}' — pulado`);
        continue;
      }

      const deleteAfter = monthsFrom(anchor, months);
      if (deleteAfter <= now) alreadyExpired += 1;

      if (APPLY) {
        batch.update(doc.ref, { deleteAfter });
        batched += 1;
        written += 1;
      }
    }

    if (APPLY && batched > 0) await batch.commit();
    cursor = snap.docs.at(-1);
    if (snap.size < PAGE) break;
  }

  grandTotal += scanned;
  grandMissing += missing;

  info(`documentos varridos: ${scanned}`);
  if (missing === 0) ok("todos já tinham 'deleteAfter' — nada a fazer");
  else if (APPLY) ok(`'deleteAfter' gravado em ${written} documento(s)`);
  else info(`${missing} documento(s) receberiam 'deleteAfter'`);
  if (skippedNoAnchor > 0) bad(`${skippedNoAnchor} sem '${from}' — resolver na mão`);
}

console.log("\n———");
info(`total varrido: ${grandTotal} · sem TTL: ${grandMissing}`);

if (alreadyExpired > 0) {
  console.log("");
  warn(
    `${alreadyExpired} documento(s) já nascem vencidos (mais velhos que a retenção).\n` +
      `    Assim que a política de TTL entrar no ar, o Firestore apaga esses em até 24h.\n` +
      `    Se for material que você precisa guardar, exporte ANTES de aplicar a política.`,
  );
}

if (!APPLY && grandMissing > 0) {
  console.log("");
  info("Satisfeito? rode de novo com --apply");
}
console.log("");
