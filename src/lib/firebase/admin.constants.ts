/**
 * Constantes usadas tanto no Edge (proxy.ts) quanto no Node.
 * Mantidas separadas de admin.ts porque aquele módulo importa
 * firebase-admin, que não roda no Edge Runtime.
 */
export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 dias
