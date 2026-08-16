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
    // Tres niveis fechados: text (17,4:1), muted (7,78:1), subtle (5,69:1).
    padrao: /\btext-(?:text|muted|subtle)\/\d+/g,
    onde: (rel) => rel.endsWith(".tsx") || rel.endsWith(".ts"),
    // Isencao do proprio ADR-020: controle DESABILITADO e isento no WCAG 2.2,
    // e ali o contraste baixo COMUNICA estado em vez de atrapalhar.
    isento: (linha) => /cursor-default|disabled|aria-disabled/.test(linha),
    comoCorrigir: "usar text-text, text-muted ou text-subtle — sem modificador de opacidade",
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
    linhas.forEach((linha, i) => {
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
