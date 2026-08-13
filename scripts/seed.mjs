#!/usr/bin/env node
/**
 * Seed inicial do Firestore.
 * Uso: node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotente: rodar de novo apenas sobrescreve os mesmos documentos.
 * Conteúdo é placeholder — substituir quando o material real dos cases
 * estiver liberado (ver docs/content-model.md §5).
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const cases = [
  {
    slug: "carrefour",
    order: 1,
    status: "published",
    title: "Carrefour Brasil",
    headline: "A sales product rolled out across every physical store in the chain.",
    client: "Carrefour Brasil",
    industry: "retail",
    year: 2022,
    duration: "2 years",
    role: "Product Designer / Design Lead",
    categories: ["enterprise", "design-systems"],
    services: ["fractional-lead"],
    deepAccess: "gated",
    ndaLevel: "soft",
    seoDescription:
      "Product design leadership for a sales platform deployed across Carrefour Brasil's physical retail network.",
    signals: [
      {
        kind: "scope",
        value: "Every physical store",
        label: "Rollout across the Carrefour Brasil network",
        attestedBy: "andre-vieira",
        verified: true,
      },
      {
        kind: "longevity",
        value: "Still in production",
        label: "In daily use years after delivery",
        attestedBy: "andre-vieira",
        verified: true,
      },
      {
        kind: "team",
        value: "Design lead",
        label: "Owned the design layer for a major retail client",
        attestedBy: "gabriela-campos-morelli",
        verified: true,
      },
    ],
    publicBlocks: [
      { type: "lead", text: "Placeholder — substituir pelo conteúdo real." },
    ],
    deepBlocks: [
      { type: "heading", text: "Discovery" },
      {
        type: "paragraph",
        text: "CONTEÚDO RESTRITO DE TESTE. Se você está vendo isto sem ter passado pelo gate, existe uma falha de segurança.",
      },
    ],
    stats: { publicViews: 0, deepRequests: 0, deepViews: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slug: "riskex",
    order: 2,
    status: "published",
    title: "Riskex",
    headline: "Product design for a complex EHS and risk management platform.",
    client: "Riskex",
    industry: "ehs-risk",
    year: 2025,
    duration: "ongoing",
    role: "Product Design Lead",
    categories: ["saas-b2b", "risk-compliance"],
    services: ["discovery-sprint", "fractional-lead"],
    deepAccess: "gated",
    ndaLevel: "strict",
    seoDescription:
      "Design leadership for a B2B SaaS platform in environment, health, safety and risk management.",
    signals: [
      {
        kind: "repeat",
        value: "Hired again in 2025",
        label: "Second engagement after working together in 2021–2023",
        attestedBy: "andre-vieira",
        verified: true,
      },
    ],
    publicBlocks: [{ type: "lead", text: "Placeholder — substituir pelo conteúdo real." }],
    deepBlocks: [
      { type: "heading", text: "Solution" },
      { type: "paragraph", text: "CONTEÚDO RESTRITO DE TESTE." },
    ],
    stats: { publicViews: 0, deepRequests: 0, deepViews: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slug: "design-system",
    order: 3,
    status: "published",
    title: "Enterprise Design System",
    headline: "Tokens, governance and a system that outlived the engagement.",
    client: "Confidential — Enterprise",
    industry: "other",
    year: 2023,
    duration: "1 year",
    role: "Design Systems Lead",
    categories: ["design-systems"],
    services: ["system-audit"],
    deepAccess: "open",
    ndaLevel: "none",
    seoDescription:
      "Design system work: tokens, component governance and adoption across product squads.",
    signals: [],
    publicBlocks: [{ type: "lead", text: "Placeholder — case totalmente público." }],
    deepBlocks: [],
    stats: { publicViews: 0, deepRequests: 0, deepViews: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const batch = db.batch();
for (const item of cases) {
  batch.set(db.collection("cases").doc(item.slug), item, { merge: true });
}
await batch.commit();

console.log(`\n✓ ${cases.length} cases gravados:`);
for (const c of cases) console.log(`  · ${c.slug.padEnd(16)} deepAccess=${c.deepAccess}`);
console.log("\nTeste o gate em: http://localhost:3000/work/carrefour/deep\n");
process.exit(0);
