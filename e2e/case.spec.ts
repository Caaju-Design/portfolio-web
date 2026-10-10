import { expect, test } from "@playwright/test";

/**
 * Pagina publica de case aberto, renderizando os blocos do Firestore.
 *
 * O case `casamento` vem do mesmo modulo que alimenta o seed de producao
 * (scripts/cases/casamento.mjs), entao o teste exercita o conteudo real.
 */
test.describe("case aberto", () => {
  test("renderiza os blocos publicos e nao mostra o muro", async ({ page }) => {
    await page.goto("/work/casamento");

    await expect(page.getByRole("heading", { level: 1, name: "Gabriela & Emanuel" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "The challenge" })).toBeVisible();
    await expect(page.getByText("The decision I'd defend hardest")).toBeVisible();
    await expect(page.getByRole("link", { name: /visit the live site/i })).toHaveAttribute(
      "href",
      "https://casamento.caaju.com.br",
    );

    // As imagens do case sao estaticas em public/cases/casamento — nenhuma pode vir quebrada.
    const imagens = page.locator("figure img");
    await expect(imagens.first()).toBeVisible();
    for (const img of await imagens.all()) {
      await expect(img).toHaveJSProperty("complete", true);
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }

    // Case aberto nao tem gate: o CTA e a call, nao o pedido de e-mail.
    await expect(page.getByLabel(/work email/i)).toHaveCount(0);
  });

  test("aparece primeiro na listagem", async ({ page }) => {
    await page.goto("/work");
    const primeiro = page.locator('a[href^="/work/"]').first();
    await expect(primeiro).toHaveAttribute("href", "/work/casamento");
  });
});
