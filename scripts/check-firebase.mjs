#!/usr/bin/env node
/**
 * Diagnostica UNAUTHENTICATED do Admin SDK.
 * Uso: node --env-file=.env.local scripts/check-firebase.mjs
 * Nunca imprime segredo — só formato e diagnóstico.
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[36m·\x1b[0m ${m}`);

// ---------- 1. Relógio ----------
console.log("\n1. Relógio do sistema");
try {
  const res = await fetch("https://www.googleapis.com/generate_204", { method: "HEAD" });
  const serverTime = new Date(res.headers.get("date")).getTime();
  const skewSec = Math.abs(Date.now() - serverTime) / 1000;
  info(`diferença para o Google: ${skewSec.toFixed(1)}s`);
  skewSec < 60
    ? ok("relógio sincronizado")
    : bad("RELÓGIO FORA DE SINCRONIA — é causa clássica de UNAUTHENTICATED. Ajuste em Ajustes do Sistema → Data e Hora.");
} catch {
  info("não foi possível checar (sem rede?)");
}

// ---------- 2. Integridade da chave ----------
console.log("\n2. Integridade da chave privada");
const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";
const key = raw.replace(/\\n/g, "\n").trim();
const lines = key.split("\n");

info(`total de linhas após normalizar: ${lines.length}`);
lines[0] === "-----BEGIN PRIVATE KEY-----" ? ok("primeira linha exata") : bad(`primeira linha inesperada: "${lines[0]?.slice(0, 40)}"`);
lines.at(-1) === "-----END PRIVATE KEY-----" ? ok("última linha exata") : bad(`última linha inesperada: "${lines.at(-1)?.slice(0, 40)}"`);

const body = lines.slice(1, -1).join("");
/^[A-Za-z0-9+/=]+$/.test(body)
  ? ok("corpo em base64 válido")
  : bad("corpo contém caractere inválido (espaço ou aspas curvas?) — a chave foi mangled ao copiar");

try {
  const { createPrivateKey } = await import("node:crypto");
  createPrivateKey(key);
  ok("chave decodifica corretamente (assinatura válida)");
} catch (e) {
  bad(`chave NÃO decodifica: ${e.message}`);
}

// ---------- 3. Conexão real ----------
console.log("\n3. Conexão com o Firestore");
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: key,
      }),
    });
  }
  await getFirestore().collection("__diagnostic").limit(1).get();
  ok("leitura no Firestore funcionou — credencial válida");
} catch (e) {
  const msg = String(e?.message ?? e);
  bad(msg.split("\n")[0]);

  if (msg.includes("UNAUTHENTICATED")) {
    console.log("\n  Causas prováveis, em ordem:");
    console.log("   a) A chave da service account foi apagada ou revogada no console");
    console.log("   b) Relógio dessincronizado (ver item 1)");
    console.log("   c) A chave pertence a OUTRO projeto");
    console.log("   d) A conta de serviço foi desativada em IAM");
  } else if (msg.includes("NOT_FOUND")) {
    console.log("\n  O banco Firestore não existe com o ID (default) neste projeto,");
    console.log("  ou foi criado com um nome customizado.");
  } else if (msg.includes("PERMISSION_DENIED")) {
    console.log("\n  Credencial válida, mas sem papel suficiente. Verifique IAM.");
  }
}

console.log("");
process.exit(0);
