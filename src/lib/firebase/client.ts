"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

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

let instancia: Auth | undefined;

export function clientAuth(): Auth {
  if (instancia) return instancia;

  instancia = getAuth(clientApp());

  // Aponta o SDK para o Firebase Auth Emulator quando a variavel existe.
  //
  // ISTO NAO E UM BYPASS. Nao concede acesso a nada: apenas troca o backend
  // de autenticacao. Se a variavel vazasse para producao, o login QUEBRARIA —
  // nao abriria. O risco e indisponibilidade, nao exposicao.
  //
  // A chamada e SINCRONA e acontece na criacao da instancia, de proposito:
  // `connectAuthEmulator` recusa reconfigurar um auth ja utilizado
  // (`auth/emulator-config-failed`). Uma versao anterior fazia isso dentro de
  // um import() dinamico e chegava tarde demais — o SDK ja tinha falado com o
  // Firebase real, e a troca do link falhava com `auth/invalid-action-code`.
  const emulador = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  if (emulador) {
    connectAuthEmulator(instancia, `http://${emulador}`, { disableWarnings: true });
  }

  return instancia;
}
