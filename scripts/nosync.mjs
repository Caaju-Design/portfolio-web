#!/usr/bin/env node
/**
 * Guarda das pastas grandes dentro do iCloud.
 *
 * O PROBLEMA
 * O projeto mora no iCloud Drive, por decisao deliberada. Mas pastas com
 * dezenas de milhares de arquivos nao podem sincronizar: o iCloud despeja
 * arquivos para a nuvem deixando placeholder no disco, e o Node quebra com
 * "Cannot find module" apontando para um pacote que existe. Pior: ele cria
 * copias de conflito ("node_modules 3") quando se confunde.
 *
 * A SOLUCAO
 * O iCloud ignora qualquer caminho terminado em `.nosync`. Entao a pasta real
 * chama-se `<nome>.nosync` e `<nome>` e apenas um symlink.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * Todo `npm ci` e `npm install` APAGA o symlink e cria pasta de verdade no
 * lugar — e a sincronizacao volta sem ninguem perceber. Foi assim que se
 * perdeu meia hora cacando um bug inexistente no Firebase (ver ADR-024).
 *
 * 🔴 EM 17/09 ELE PASSOU A CUIDAR TAMBEM DO `.next`, e o motivo foi medicao:
 *    o `.next` estava como pasta real com 411 MB desde 16/08, sincronizando
 *    havia um mes. Existia um `.next.nosync` VAZIO de 13/08 — alguem comecou
 *    a protecao e nao terminou. Guarda que cobre uma pasta de duas nao e
 *    guarda, e a que ficou de fora era a maior.
 *
 * ⛔ AS DUAS NAO TEM A MESMA POLITICA, e a diferenca e a decisao central
 *    deste arquivo:
 *
 *      node_modules  NAO e descartavel. Com duas arvores o script se RECUSA
 *                    a adivinhar qual esta integra: apagar a errada perde a
 *                    instalacao, e `npm ci` leva minutos e precisa de rede.
 *      .next         E descartavel. E saida de build: apagar as duas e
 *                    refazer e sempre correto, e o proximo build repovoa.
 *                    Pedir intervencao humana aqui seria cerimonia.
 *
 * MODOS
 *   node scripts/nosync.mjs          verifica e falha se estiver perigoso
 *   node scripts/nosync.mjs --fix    conserta o que der, sozinho
 *
 * Fora do iCloud nao faz nada: em CI sao pastas comuns, e mexer nelas ali
 * seria quebrar o que esta certo.
 */

import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, renameSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const corrigir = process.argv.includes("--fix");

const vermelho = (m) => `\x1b[31m${m}\x1b[0m`;
const amarelo = (m) => `\x1b[33m${m}\x1b[0m`;
const verde = (m) => `\x1b[32m${m}\x1b[0m`;

/**
 * ⚠️ `remedio` e citado na mensagem de erro. Ele existe como campo, e nao
 *    como texto fixo, porque a saida para cada pasta e diferente — e mensagem
 *    de erro que manda rodar o comando errado custa mais que nao ter mensagem.
 */
const GUARDADAS = [
  { nome: "node_modules", descartavel: false, remedio: "npm run reinstall" },
  { nome: ".next", descartavel: true, remedio: "npm run clean" },
];

// Fora do iCloud este script nao tem o que fazer.
if (!raiz.includes("Mobile Documents/com~apple~CloudDocs")) {
  process.exit(0);
}

const conteudoDaRaiz = readdirSync(raiz);
let houveProblema = false;

for (const { nome, descartavel, remedio } of GUARDADAS) {
  const link = join(raiz, nome);
  const real = join(raiz, `${nome}.nosync`);

  const existe = existsSync(link) || lstatExiste(link);
  const ehSymlink = lstatExiste(link) && lstatSync(link).isSymbolicLink();

  /**
   * ⚠️ Copias de conflito do iCloud: sinal de que ja sincronizou o que nao
   *    devia. O escape do ponto importa — sem ele `.next` casaria com
   *    "anext", e regex que casa demais e pior que regex que nao casa.
   */
  const escapado = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const conflitos = conteudoDaRaiz.filter((n) =>
    new RegExp(`^${escapado}( \\d+)$|^${escapado}\\.nosync \\d+$`).test(n),
  );

  /**
   * 🔴 `ehSymlink` SOZINHO NAO BASTA, e foi assim que a primeira versao deste
   *    guarda passou num symlink quebrado — medido pela prova 6 em 17/09.
   *
   *    Um link que aponta para pasta inexistente E um symlink, e a saida
   *    antecipada o dava por correto. E justamente o estado que produz
   *    "Cannot find module" num pacote instalado: o caminho existe, o destino
   *    nao. Por isso as tres condicoes, e nao uma.
   */
  const alvoCerto = ehSymlink && readlinkSync(link) === `${nome}.nosync`;
  const saudavel = alvoCerto && existsSync(real) && conflitos.length === 0;

  if (saudavel) {
    if (corrigir) console.log(`  ${verde("✓")} ${nome} → ${nome}.nosync`);
    continue;
  }

  // Nada existe ainda: nao ha o que proteger, e criar link para pasta
  // inexistente so cria symlink quebrado.
  if (!existe && !existsSync(real) && conflitos.length === 0) continue;

  if (!corrigir) {
    houveProblema = true;
    console.error(`
  ${vermelho(`${nome} está exposto ao iCloud.`)}

  Esperado:   ${nome} -> ${nome}.nosync
  Encontrado: ${ehSymlink ? "symlink correto" : vermelho("pasta real (sincronizando)")}
  ${conflitos.length ? amarelo(`Cópias de conflito: ${conflitos.join(", ")}`) : ""}
  Corrija antes de continuar:

      ${verde(remedio)}
`);
    continue;
  }

  // ---- a partir daqui, --fix ----

  for (const c of conflitos) rmSync(join(raiz, c), { recursive: true, force: true });

  const duasArvores = lstatExiste(link) && !ehSymlink && existsSync(real);

  if (duasArvores && !descartavel) {
    houveProblema = true;
    console.error(`
  ${vermelho(`Existem DUAS árvores de ${nome}:`)}

      ${nome}         (pasta real, sincronizando)
      ${nome}.nosync  (pasta real)

  Não dá para adivinhar qual está íntegra. Apague as duas e refaça:

      ${verde(remedio)}
`);
    continue;
  }

  if (duasArvores && descartavel) {
    // Saida de build: as duas vao embora e o proximo build repovoa.
    rmSync(link, { recursive: true, force: true });
    rmSync(real, { recursive: true, force: true });
    console.log(`  ${amarelo("↻")} ${nome}: duas pastas apagadas (saída de build, o próximo build refaz)`);
  } else if (lstatExiste(link) && !ehSymlink) {
    renameSync(link, real);
  } else if (ehSymlink) {
    // Symlink existente porem quebrado, ou apontando para outro lugar.
    rmSync(link, { force: true });
  }

  if (!existsSync(real)) mkdirSync(real, { recursive: true });
  symlinkSync(`${nome}.nosync`, link, "dir");
  console.log(`  ${verde("✓")} ${nome} → ${nome}.nosync (fora do alcance do iCloud)`);
}

/**
 * 🔴 `existsSync` segue o symlink: para um link QUEBRADO ele devolve false, e
 *    o script pularia a correcao achando que nao ha nada ali — deixando um
 *    symlink apontando para o vazio, que e exatamente o estado que produz
 *    "Cannot find module" em pacote instalado. `lstatSync` olha o proprio link.
 */
function lstatExiste(p) {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

process.exit(houveProblema ? 1 : 0);
