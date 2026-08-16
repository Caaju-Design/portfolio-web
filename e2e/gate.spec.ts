import { expect, test, type Page } from "@playwright/test";

/**
 * O fluxo completo do gate, contra os emuladores do Firebase.
 *
 * POR QUE ESTE TESTE EXISTE
 * Em 2026-08-15 descobriu-se que o gate NUNCA tinha aberto para ninguem:
 * `setCustomUserClaims` nao altera token ja emitido, e o cookie de sessao
 * nascia sem `caseAccess`. A pagina protegida devolvia 404 para todo mundo,
 * sempre — e como o 404 dizia "This page doesn't exist", parecia falta de
 * conteudo. Ver ADR-026.
 *
 * Este teste teria falhado no primeiro run.
 *
 * COMO O LINK CHEGA ATE AQUI
 * Sem interceptar e-mail e sem bypass na aplicacao: o Auth Emulator expoe os
 * codigos pendentes em /emulator/v1/projects/{id}/oobCodes. O codigo exercitado
 * e exatamente o de producao.
 */

const PROJETO = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "portfolio-6a82b";
const EMULADOR = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const CASE = "carrefour";

/**
 * Confere que caiu no gate apontando para o case certo.
 *
 * Compara o parametro DECODIFICADO de proposito: o redirect do proxy usa
 * `searchParams.set`, que codifica (`%2Fwork%2F...`), enquanto o botao do
 * VerifyClient monta a URL com template literal, que nao codifica. As duas
 * formas estao corretas — e o teste nao deveria ter opiniao sobre qual.
 */
async function esperaGate(page: Page, slug: string) {
  await expect(page).toHaveURL(/\/access\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(`/work/${slug}/deep`);
}

/** O envio e assincrono: buscar o link antes da confirmacao e corrida. */
async function pedeAcesso(page: Page, email: string) {
  await page.getByLabel(/work email/i).fill(email);
  await page.getByRole("button", { name: /send me the link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();
}

/** Ultimo link magico emitido para este endereco, direto do emulador. */
async function ultimoLinkPara(email: string): Promise<string> {
  const res = await fetch(`http://${EMULADOR}/emulator/v1/projects/${PROJETO}/oobCodes`);
  if (!res.ok) throw new Error(`emulador respondeu ${res.status}`);

  const { oobCodes } = (await res.json()) as {
    oobCodes: { email: string; oobLink: string; requestType: string }[];
  };

  const meus = oobCodes.filter(
    (c) => c.email === email && c.requestType === "EMAIL_SIGNIN",
  );
  const ultimo = meus.at(-1);
  if (!ultimo) throw new Error(`nenhum link para ${email}`);
  return ultimo.oobLink;
}

/** E-mail unico por execucao: o rate limit e 3 por endereco por hora. */
function emailDeTeste(): string {
  return `e2e-${Date.now()}@acme-teste.com`;
}

test.describe("gate de acesso aos deep dives", () => {
  test("sem sessao, a rota protegida manda para o formulario", async ({ page }) => {
    await page.goto(`/work/${CASE}/deep`);
    await esperaGate(page, CASE);
    await expect(page.getByLabel(/work email/i)).toBeVisible();
  });

  test("o caminho completo: pedir, receber, verificar e ler", async ({ page }) => {
    const email = emailDeTeste();

    await page.goto(`/work/${CASE}/deep`);
    await pedeAcesso(page, email);

    // O link sai do emulador, nao de uma caixa de e-mail.
    const link = await ultimoLinkPara(email);
    await page.goto(link);

    // ESTA e a asserção que teria pego o bug do ADR-026.
    await expect(page).toHaveURL(new RegExp(`/work/${CASE}/deep$`));
    await expect(page.getByText(/confidential/i)).toBeVisible();

    // A marca d'agua carrega o endereco de quem leu — dissuasao de vazamento.
    await expect(page.getByText(email, { exact: false }).first()).toBeVisible();
  });

  test("autenticado para um case nao entra em outro pela porta lateral", async ({ page }) => {
    const email = emailDeTeste();

    await page.goto(`/work/${CASE}/deep`);
    await pedeAcesso(page, email);
    await page.goto(await ultimoLinkPara(email));
    await expect(page).toHaveURL(new RegExp(`/work/${CASE}/deep$`));

    // Outro case, mesma sessao: vai ao gate, NAO recebe 404.
    // Ele ja provou o e-mail e a existencia do case e publica em /work.
    await page.goto("/work/riskex/deep");
    await esperaGate(page, "riskex");
  });

  test("o botao de novo link carrega o case junto", async ({ page }) => {
    // Regressao: o botao ia para /access sem `next`, a API recusava com 400
    // e o formulario exibia "Check your inbox" assim mesmo. Beco sem saida
    // que mentia para o visitante.
    // Sem `mode=signIn` o `isSignInWithEmailLink` recusa a URL e o componente
    // cai no estado de erro — que e onde o botao vive. Com `mode=signIn` e
    // localStorage vazio ele mostraria o formulario "Confirm your email".
    await page.goto(`/access/verify?case=${CASE}&oobCode=invalido`);
    await page.getByRole("link", { name: /request a new link/i }).click();
    await esperaGate(page, CASE);
  });
});
