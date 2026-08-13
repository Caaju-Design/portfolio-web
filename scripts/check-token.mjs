#!/usr/bin/env node
/**
 * Ground truth: faz a troca OAuth2 na mão e mostra o erro exato do Google.
 * Uso: node --env-file=.env.local scripts/check-token.mjs
 */
import { createSign } from "node:crypto";

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);

const unsigned =
  b64({ alg: "RS256", typ: "JWT" }) +
  "." +
  b64({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });

const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");

console.log(`\nService account : ${clientEmail}`);
console.log(`Projeto         : ${projectId}\n`);

console.log("1. Trocando JWT por access token…");
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${unsigned}.${signature}`,
  }),
});

const tokenBody = await tokenRes.json();

if (!tokenRes.ok) {
  console.log(`   \x1b[31m✗ HTTP ${tokenRes.status}\x1b[0m`);
  console.log(`   error             : ${tokenBody.error}`);
  console.log(`   error_description : ${tokenBody.error_description}\n`);

  const d = String(tokenBody.error_description ?? "");
  if (d.includes("Invalid JWT Signature")) {
    console.log("   → A chave privada NÃO pertence a esta service account.");
    console.log("     Gere uma chave nova em Configurações do projeto → Contas de serviço.");
  } else if (d.includes("Invalid email") || d.includes("not found")) {
    console.log("   → A service account não existe (foi apagada?).");
  } else if (tokenBody.error === "unauthorized_client") {
    console.log("   → Service account desativada em IAM, ou bloqueada por política da organização.");
  } else if (d.includes("Invalid JWT") && d.includes("iat")) {
    console.log("   → Problema de relógio.");
  }
  process.exit(1);
}

console.log("   \x1b[32m✓ access token obtido — a credencial é VÁLIDA\x1b[0m\n");

console.log("2. Chamando a API do Firestore…");
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/__diagnostic`;
const apiRes = await fetch(url, { headers: { Authorization: `Bearer ${tokenBody.access_token}` } });
const apiBody = await apiRes.json().catch(() => ({}));

if (apiRes.ok) {
  console.log("   \x1b[32m✓ Firestore respondeu — está tudo funcionando\x1b[0m\n");
  process.exit(0);
}

console.log(`   \x1b[31m✗ HTTP ${apiRes.status}\x1b[0m`);
console.log(`   status  : ${apiBody?.error?.status}`);
console.log(`   message : ${apiBody?.error?.message}\n`);

const m = String(apiBody?.error?.message ?? "");
if (m.includes("has not been used") || m.includes("disabled")) {
  console.log("   → A API do Firestore não está ativada neste projeto.");
  console.log("     Ative em: APIs e serviços → Ativar APIs → 'Cloud Firestore API'");
} else if (apiBody?.error?.status === "NOT_FOUND") {
  console.log("   → Banco '(default)' não existe. Foi criado com outro ID?");
} else if (apiBody?.error?.status === "PERMISSION_DENIED") {
  console.log("   → Falta papel de IAM na service account (Cloud Datastore User).");
}
process.exit(1);
