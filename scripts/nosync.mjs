#!/usr/bin/env node
/**
 * Guarda do node_modules dentro do iCloud.
 *
 * O PROBLEMA
 * O projeto mora no iCloud Drive, por decisao deliberada. Mas o node_modules
 * tem ~177 pacotes e dezenas de milhares de arquivos, e nao pode sincronizar:
 * o iCloud despeja arquivos para a nuvem deixando placeholder no disco, e o
 * Node quebra com "Cannot find module" apontando para um pacote que existe.
 * Pior: ele cria copias de conflito ("node_modules 3") quando se confunde.
 *
 * A SOLUCAO
 * O iCloud ignora qualquer caminho terminado em `.nosync`. Entao a pasta real
 * chama-se `node_modules.nosync` e `node_modules` e apenas um symlink.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * Todo `npm ci` e `npm install` APAGA o symlink e cria pasta de verdade no
 * lugar — e a sincronizacao volta sem ninguem perceber. Foi assim que se
 * perdeu meia hora cacando um bug inexistente no Firebase (ver ADR-024).
 *
 * MODOS
 *   node scripts/nosync.mjs          verifica e falha se estiver perigoso
 *   node scripts/nosync.mjs --fix    move a pasta e refaz o symlink
 *
 * Fora do iCloud nao faz nada: em CI o node_modules e pasta comum, e mexer
 * nele ali seria quebrar o que esta certo.
 */

import { existsSync, lstatSync, readdirSync, renameSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const real = join(raiz, "node_modules.nosync");
const link = join(raiz, "node_modules");
const corrigir = process.argv.includes("--fix");

const vermelho = (m) => `\x1b[31m${m}\x1b[0m`;
const amarelo = (m) => `\x1b[33m${m}\x1b[0m`;
const verde = (m) => `\x1b[32m${m}\x1b[0m`;

// Fora do iCloud este script nao tem o que fazer.
if (!raiz.includes("Mobile Documents/com~apple~CloudDocs")) {
  process.exit(0);
}

const ehSymlink = existsSync(link) && lstatSync(link).isSymbolicLink();

// Copias de conflito do iCloud: sinal de que ja sincronizou o que nao devia.
const conflitos = readdirSync(raiz).filter(
  (n) => /^node_modules( \d+)$/.test(n) || /^node_modules\.nosync \d+$/.test(n),
);

if (ehSymlink && conflitos.length === 0) {
  if (corrigir) console.log(`  ${verde("✓")} node_modules já é symlink para .nosync`);
  process.exit(0);
}

if (!corrigir) {
  console.error(`
  ${vermelho("node_modules está exposto ao iCloud.")}

  Esperado:  node_modules -> node_modules.nosync
  Encontrado: ${ehSymlink ? "symlink correto" : vermelho("pasta real (sincronizando)")}
  ${conflitos.length ? amarelo(`Cópias de conflito: ${conflitos.join(", ")}`) : ""}

  Isso causa "Cannot find module" em pacotes que existem — o arquivo está
  na nuvem, não no disco. Corrija antes de continuar:

      ${verde("npm run reinstall")}
`);
  process.exit(1);
}

// --fix
if (existsSync(link) && !ehSymlink) {
  if (existsSync(real)) {
    console.error(`
  ${vermelho("Existem DUAS árvores de dependência:")}

      node_modules         (pasta real, sincronizando)
      node_modules.nosync  (pasta real)

  Não dá para adivinhar qual está íntegra. Apague as duas e reinstale:

      ${verde("npm run reinstall")}
`);
    process.exit(1);
  }
  renameSync(link, real);
}

symlinkSync("node_modules.nosync", link, "dir");
console.log(`  ${verde("✓")} node_modules -> node_modules.nosync (fora do alcance do iCloud)`);
