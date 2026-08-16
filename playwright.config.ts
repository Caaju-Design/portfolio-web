import { defineConfig, devices } from "@playwright/test";

/**
 * Roda contra os emuladores do Firebase, nunca contra producao.
 *
 * O `webServer` sobe o Next em modo desenvolvimento com as variaveis que
 * apontam Admin SDK e SDK client para os emuladores. Nenhum dado real e
 * tocado, e nenhum e-mail e enviado.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // o gate cria sessao; execucoes paralelas se atrapalham
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    // localhost, NAO 127.0.0.1.
    //
    // O `next dev` bloqueia requisicoes cross-origin a /_next/static vindas de
    // hosts nao reconhecidos, e trata 127.0.0.1 como um deles. O JavaScript nao
    // carrega, a pagina nao hidrata, e todo teste de comportamento falha por um
    // motivo que nada tem a ver com o comportamento.
    //
    // Trocar o host resolve sem tocar em next.config.ts — a alternativa seria
    // `allowedDevOrigins`, que e configuracao de aplicacao para servir a teste.
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Admin SDK detecta estas duas sozinho.
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      // O SDK client precisa da versao NEXT_PUBLIC para chegar ao navegador.
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      // O magic link e gerado com `site.url` como continueUrl. Sem isto, o
      // .env.local manda o link para PRODUCAO e o teste sai do ambiente.
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      // Sem n8n: em desenvolvimento a rota apenas registra o link no console
      // em vez de lancar excecao. O teste pega o link pelo emulador.
      N8N_MAGIC_LINK_WEBHOOK_URL: "",
      N8N_WEBHOOK_SECRET: "",
    },
  },
});
