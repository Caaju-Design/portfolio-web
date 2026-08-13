#!/usr/bin/env node
/**
 * Valida o .env.local sem NUNCA imprimir valor de segredo.
 * Uso: node --env-file=.env.local scripts/check-env.mjs
 */

const REQUIRED = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const OPTIONAL = ["N8N_WEBHOOK_URL", "N8N_MAGIC_LINK_WEBHOOK_URL", "N8N_WEBHOOK_SECRET"];

let failed = false;
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => { failed = true; console.log(`  \x1b[31m✗\x1b[0m ${m}`); };
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

/** Valores de exemplo que costumam sobreviver ao copiar/colar do template. */
const PLACEHOLDERS = [
  "xxxxx", "xxx", "AIza...", "seu-projeto", "your-project",
  "MIIEvQIBADANBg...", "-----END PRIVATE KEY-----\\n\"", "changeme", "TODO",
];

console.log("\nVariáveis obrigatórias");
for (const key of REQUIRED) {
  const value = process.env[key];
  if (!value) { bad(`${key} — ausente`); continue; }

  const hit = PLACEHOLDERS.find((p) => value.includes(p));
  if (hit) {
    bad(`${key} — ainda contém o placeholder "${hit}" do template`);
    continue;
  }
  ok(`${key} — definida (${value.length} caracteres)`);
}

console.log("\nFormato da chave privada");
const key = process.env.FIREBASE_PRIVATE_KEY;
if (!key) {
  bad("FIREBASE_PRIVATE_KEY ausente");
} else {
  const normalized = key.replace(/\\n/g, "\n");
  normalized.includes("-----BEGIN PRIVATE KEY-----")
    ? ok("cabeçalho BEGIN PRIVATE KEY presente")
    : bad("falta o cabeçalho BEGIN PRIVATE KEY — copiou o valor completo?");
  normalized.trimEnd().endsWith("-----END PRIVATE KEY-----")
    ? ok("rodapé END PRIVATE KEY presente")
    : bad("falta o rodapé END PRIVATE KEY");
  normalized.split("\n").length > 10
    ? ok("quebras de linha resolvidas corretamente")
    : bad("as quebras de linha não foram resolvidas — envolva o valor em aspas duplas");
}

console.log("\nCoerência entre projetos");
const publicId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const adminId = process.env.FIREBASE_PROJECT_ID;
if (publicId && adminId) {
  publicId === adminId
    ? ok(`client e admin apontam para o mesmo projeto (${adminId})`)
    : bad(`divergência: client="${publicId}" admin="${adminId}"`);
}

const email = process.env.FIREBASE_CLIENT_EMAIL;
if (email && adminId) {
  const expected = new RegExp(`^firebase-adminsdk-[a-z0-9]{4,8}@${adminId}\\.iam\\.gserviceaccount\\.com$`);
  if (expected.test(email)) {
    ok("service account com formato válido e do projeto correto");
  } else if (email.includes("xxxxx")) {
    bad("service account ainda é o placeholder do template — copie o client_email real do JSON");
  } else if (!email.endsWith(`@${adminId}.iam.gserviceaccount.com`)) {
    bad(`service account não pertence ao projeto ${adminId}`);
  } else {
    warn(`formato incomum: "${email}" — confira contra o JSON`);
  }
}

console.log("\nOpcionais (n8n)");
for (const key of OPTIONAL) {
  process.env[key] ? ok(`${key} — definida`) : warn(`${key} — ausente (magic link cai no console em dev)`);
}

console.log(failed ? "\n\x1b[31mFalhou.\x1b[0m Corrija os itens acima.\n" : "\n\x1b[32mTudo certo.\x1b[0m\n");
process.exit(failed ? 1 : 0);
