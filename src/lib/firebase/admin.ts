import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Admin SDK — servidor apenas.
 * O import de "server-only" garante erro de build se alguém tentar
 * puxar este módulo em Client Component. É a primeira linha de defesa
 * contra vazamento acidental de credencial.
 */
function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Contra o emulador, credencial nao existe e nao faz falta: o emulador nao
  // autentica ninguem. Exigir `cert()` aqui obrigaria a inventar uma chave
  // privada valida so para o CI — e chave falsa em repositorio e o tipo de
  // coisa que um dia alguem copia achando que e de verdade.
  //
  // ISTO NAO ENFRAQUECE PRODUCAO. Depende de FIRESTORE_EMULATOR_HOST, que so
  // e definido pelo playwright.config.ts. Se a variavel vazasse para o ar, o
  // servidor apontaria para um emulador inexistente e o site QUEBRARIA — nao
  // abriria. Mesmo racional do emulador no client (ver lib/firebase/client.ts).
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return initializeApp({ projectId: projectId ?? "demo-caaju" });
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin não configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());

export { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./admin.constants";
