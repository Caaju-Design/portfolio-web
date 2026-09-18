#!/usr/bin/env node
/**
 * Faz os ADRs valerem, em vez de so existirem.
 *
 * Decisao registrada em documento e decisao que o time esquece. Aqui as regras
 * que cabem em verificacao automatica passam a barrar commit e CI.
 *
 * Uso: node scripts/check-adr.mjs        (retorna 1 se houver violacao)
 *
 * NAO substitui ESLint. Cobre o que e especifico deste projeto — o resto do
 * ecossistema ja tem ferramenta pronta.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fonte = join(raiz, "src");

const vermelho = (m) => `\x1b[31m${m}\x1b[0m`;
const amarelo = (m) => `\x1b[33m${m}\x1b[0m`;
const verde = (m) => `\x1b[32m${m}\x1b[0m`;
const cinza = (m) => `\x1b[90m${m}\x1b[0m`;

const REGRAS = [
  {
    id: "ADR-020",
    titulo: "opacidade proibida em cor de texto",
    // `text-muted/70` dava 4,25:1 e `text-muted/60` dava 3,39:1 — os dois
    // reprovam no WCAG AA, e nenhum linter acusa, porque parece ajuste visual.
    //
    // REMEDIDO EM 17/09, no tema claro do Design System (ADR-028). A margem
    // ENCOLHEU e a regra ficou mais necessaria, nao menos:
    //     text   #101014 sobre #f4f4f5 = 17,00:1
    //     muted  #6b6b76 sobre #f4f4f5 =  4,85:1   (antes eram 7,78)
    //     subtle  — o sistema tem UM nivel apagado, virou alias de muted
    // Com 4,85:1 qualquer opacidade reprova de primeira: `/90` ja cai para
    // ~4,2. No tema escuro havia folga para errar; aqui nao ha.
    padrao: /\btext-(?:text|muted|subtle)\/\d+/g,
    onde: (rel) => rel.endsWith(".tsx") || rel.endsWith(".ts"),
    // Isencao do proprio ADR-020: controle DESABILITADO e isento no WCAG 2.2,
    // e ali o contraste baixo COMUNICA estado em vez de atrapalhar.
    isento: (linha) => /cursor-default|disabled|aria-disabled/.test(linha),
    comoCorrigir: "usar text-text, text-muted ou text-subtle — sem modificador de opacidade",
  },
  {
    id: "ADR-028",
    titulo: "lima so existe como preenchimento",
    /**
     * O destaque do tema (#e3ff00) sobre o fundo claro (#f4f4f5) mede
     * 1,04:1. Como cor de TEXTO ou de LINHA ele e invisivel — nao "pouco
     * legivel": invisivel. Medido em 17/09.
     *
     * O proprio Design System ja separa os dois papeis: `--cor-destaque` e
     * preenchimento, com conteudo escuro em cima, e `--cor-destaque-texto`
     * (#687500) e a variante escurecida para letra, em 4,6:1. Aqui isso vira
     * `bg-primary` + `text-on-primary` contra `text-primary-text`.
     *
     * Esta regra existe porque a migracao de 17/09 achou 33 usos de
     * `text-primary`/`text-accent` e 22 de `border-primary/N`. Todos vinham
     * do tema escuro, onde o destaque era ciano e funcionava como letra.
     * Nenhum deu erro; todos teriam sumido da tela em silencio.
     */
    padrao: /\b(?:text|border|decoration|outline|ring|fill|stroke|from|via|to)-(?:primary|accent)\b(?!-)/g,
    onde: (rel) => rel.endsWith(".tsx") || rel.endsWith(".ts"),
    /**
     * Sobre bloco INVERTIDO o lima como letra mede 16,3:1 e e legitimo — e
     * ali que ele brilha. A isencao olha a propria linha: se ela pinta o
     * fundo escuro, o destaque pode ser a letra.
     */
    isento: (linha) => /bg-inverted|lima-ok/.test(linha),
    comoCorrigir:
      "preenchimento: bg-primary + text-on-primary · letra: text-primary-text · linha: border-inverted",
  },
  {
    id: "SEC-§0",
    titulo: "SDK client do Firebase fora do codigo de servidor",
    // O Firestore e deny-all e todo acesso passa pelo Admin SDK no servidor.
    // Import do SDK client em codigo de servidor e o primeiro passo para
    // reintroduzir o vetor que a arquitetura inteira existe para eliminar.
    padrao: /from\s+["']firebase\/(firestore|auth|app)["']/g,
    onde: (rel) =>
      (rel.startsWith("app/api/") || rel.startsWith("lib/") || rel === "proxy.ts") &&
      rel !== "lib/firebase/client.ts",
    isento: () => false,
    comoCorrigir: "usar o Admin SDK via @/lib/firebase/admin",
  },
  {
    id: "ADR-002",
    titulo: "dominio nunca hardcoded",
    // Trocar de dominio deve ser trocar uma variavel, nao caçar string.
    padrao: /["'`]https?:\/\/(?:www\.)?caaju\.com\.br/g,
    onde: (rel) => (rel.endsWith(".tsx") || rel.endsWith(".ts")) && rel !== "lib/site.ts",
    isento: (linha) => /^\s*(\/\/|\*)/.test(linha), // comentario pode citar
    comoCorrigir: "usar site.url de @/lib/site",
  },
];

/**
 * Marca as linhas que sao comentario, para a regra nao acusar a propria
 * documentacao.
 *
 * 🔴 EXISTE PORQUE ACONTECEU. Em 17/09 a regra ADR-028 acusou
 *    `src/components/ui/Badge.tsx:8` — a linha onde o comentario EXPLICA que
 *    `bg-primary/10 text-primary` foi removido e por que. O gate estava
 *    barrando a explicacao do proprio conserto.
 *
 * ⛔ Nao e capricho. Gate que acusa documentacao ensina o time a ignorar o
 *    gate, e um gate ignorado e pior que gate nenhum: da a sensacao de
 *    protecao sem a protecao. Tambem empurra quem escreve a NAO documentar o
 *    que arrumou, que e exatamente o comentario mais valioso que existe.
 *
 * ⚠️ O custo e falso NEGATIVO: violacao dentro de template literal que comece
 *    com asterisco passaria batido. E o lado certo para errar — deixar de
 *    acusar uma linha rara custa menos que acusar documentacao toda semana.
 */
function marcarComentarios(linhas) {
  const marca = new Array(linhas.length).fill(false);
  let dentroDeBloco = false;
  linhas.forEach((linha, i) => {
    const t = linha.trim();
    if (dentroDeBloco) {
      marca[i] = true;
      if (t.includes("*/")) dentroDeBloco = false;
      return;
    }
    if (t.startsWith("//") || t.startsWith("*")) { marca[i] = true; return; }
    if (t.startsWith("/*") || t.startsWith("{/*")) {
      marca[i] = true;
      if (!t.includes("*/")) dentroDeBloco = true;
    }
  });
  return marca;
}

function arquivos(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.(ts|tsx)$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

let violacoes = 0;
let isencoes = 0;

for (const regra of REGRAS) {
  const achados = [];
  for (const caminho of arquivos(fonte)) {
    const rel = relative(fonte, caminho);
    if (!regra.onde(rel)) continue;

    const linhas = readFileSync(caminho, "utf8").split("\n");
    const ehComentario = marcarComentarios(linhas);
    linhas.forEach((linha, i) => {
      if (ehComentario[i]) return;
      for (const m of linha.matchAll(regra.padrao)) {
        if (regra.isento(linha)) { isencoes += 1; continue; }
        achados.push({ rel, linha: i + 1, trecho: m[0] });
      }
    });
  }

  if (achados.length === 0) {
    console.log(`  ${verde("✓")} ${regra.id} — ${regra.titulo}`);
  } else {
    violacoes += achados.length;
    console.log(`  ${vermelho("✗")} ${regra.id} — ${regra.titulo}`);
    for (const a of achados) {
      console.log(`      src/${a.rel}:${a.linha}  ${vermelho(a.trecho)}`);
    }
    console.log(`      ${cinza("→ " + regra.comoCorrigir)}`);
  }
}

console.log("");
if (isencoes > 0) {
  console.log(`  ${amarelo("!")} ${isencoes} ocorrência(s) isenta(s) por regra do próprio ADR`);
}

if (violacoes > 0) {
  console.log(`  ${vermelho(`${violacoes} violação(ões) de ADR`)}\n`);
  console.log(cinza("  Se a decisão mudou, mude o ADR primeiro — e depois esta regra.\n"));
  process.exit(1);
}
console.log(`  ${verde("nenhuma violação de ADR")}\n`);
