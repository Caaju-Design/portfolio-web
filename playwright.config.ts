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
    // Em CI, contra o build de PRODUCAO. Localmente, contra o dev.
    //
    // `next dev` compila rota sob demanda, mantem HMR e roda verificacoes que
    // nao existem em producao. Num runner compartilhado e frio isso fica lento
    // o bastante para estourar os tempos limite — e os testes falhavam por
    // motivo que nada tinha a ver com o comportamento sob teste.
    //
    // Testar o build de producao e mais rapido E mais honesto: e o artefato
    // que o visitante recebe. Bug que so aparece em producao passaria batido
    // num teste que so exercita o modo de desenvolvimento.
    //
    // Localmente segue `dev`, pelo ciclo curto de edicao e reexecucao.
    command: process.env.CI ? "npm run build && npm start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // O build precisa caber aqui dentro.
    timeout: 180_000,
    env: {
      // Admin SDK detecta estas duas sozinho.
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",

      // O projeto precisa ser o MESMO que o emulador serve (vem do .firebaserc),
      // senao o teste procura oobCode num projeto e o app emite noutro.
      FIREBASE_PROJECT_ID: "portfolio-6a82b",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "portfolio-6a82b",

      // Valores de fachada. Contra o emulador nada disso e verificado — mas o
      // SDK recusa iniciar com apiKey indefinida, e no runner nao existe
      // .env.local. Declarar aqui torna o teste hermetico: roda igual na
      // maquina do dev e no CI, sem depender de arquivo local nenhum.
      NEXT_PUBLIC_FIREBASE_API_KEY: "fake-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "localhost",
      // O SDK client precisa da versao NEXT_PUBLIC para chegar ao navegador.
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      // O magic link e gerado com `site.url` como continueUrl. Sem isto, o
      // .env.local manda o link para PRODUCAO e o teste sai do ambiente.
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      // Sem n8n, de proposito: nenhum e-mail sai durante o teste.
      //
      // Em `dev` a rota so registra o link no console. No build de PRODUCAO
      // (que e o que o CI usa) ela LANCA — e tudo bem: `generateSignInWithEmailLink`
      // roda ANTES do envio, entao o oobCode ja existe no emulador quando a
      // excecao acontece. O teste pega o link de la, nao do e-mail.
      //
      // Efeito colateral aceito: em CI o `logAccess({action:"requested"})` nao
      // roda, porque vem depois do envio. Nenhum teste depende disso hoje — mas
      // se um dia depender, e aqui que a explicacao mora.
      N8N_MAGIC_LINK_WEBHOOK_URL: "",
      N8N_WEBHOOK_SECRET: "",
    },
  },
});
