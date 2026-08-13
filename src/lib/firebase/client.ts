"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * SDK client. Estas chaves são públicas por design — não são segredo.
 * A autorização real acontece no servidor; aqui só trocamos o link
 * mágico por um ID token.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export function clientApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}

export function clientAuth(): Auth {
  return getAuth(clientApp());
}
