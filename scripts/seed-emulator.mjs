#!/usr/bin/env node
/**
 * Popula o Firestore Emulator com o minimo para o teste de ponta a ponta.
 *
 * NAO toca em producao — e recusa rodar se o emulador nao estiver no ambiente.
 * Essa recusa e proposital: um seeder que "funciona mesmo assim" acabaria
 * escrevendo dados de teste no banco real algum dia.
 */

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    "\n  FIRESTORE_EMULATOR_HOST nao definido.\n" +
      "  Este script so roda contra o emulador. Use: npm run e2e\n",
  );
  process.exit(1);
}

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "portfolio-6a82b";

if (!getApps().length) {
  // Sem credencial, de proposito. Com FIRESTORE_EMULATOR_HOST definido, o
  // Admin SDK fala com o emulador e nao autentica nada — so o projectId
  // importa. Passar um `cert()` falso aqui falha ANTES de tocar o emulador,
  // porque o cert() faz o parse da chave localmente.
  initializeApp({ projectId });
}
const db = getFirestore();

/** So os campos que o gate e a listagem realmente leem. */
const CASES = [
  {
    slug: "carrefour",
    title: "Carrefour Brasil",
    headline: "A sales product rolled out across every physical store in the chain.",
    client: "Carrefour Brasil",
    industry: "Retail",
    year: 2024,
    role: "Product Design Lead",
    duration: "14 months",
    categories: ["Enterprise"],
    services: ["Product design"],
    deepAccess: "gated",
    signals: [],
    seoDescription: "Carrefour Brasil case study.",
    status: "published",
    order: 1,
  },
  {
    slug: "riskex",
    title: "Riskex",
    headline: "Risk management, made legible.",
    client: "Riskex",
    industry: "Insurance",
    year: 2023,
    role: "Fractional Design Lead",
    duration: "8 months",
    categories: ["B2B SaaS"],
    services: ["Design system"],
    deepAccess: "gated",
    signals: [],
    seoDescription: "Riskex case study.",
    status: "published",
    order: 2,
  },
  {
    slug: "design-system",
    title: "Design system",
    headline: "One system, many products.",
    client: "Confidential",
    industry: "SaaS",
    year: 2025,
    role: "Design Lead",
    duration: "6 months",
    categories: ["Design system"],
    services: ["Design system"],
    deepAccess: "open",
    signals: [],
    seoDescription: "Design system case study.",
    status: "published",
    order: 3,
  },
];

const lote = db.batch();
for (const c of CASES) lote.set(db.collection("cases").doc(c.slug), c);
await lote.commit();

console.log(`  emulador populado: ${CASES.length} cases (${CASES.map((c) => c.slug).join(", ")})`);
