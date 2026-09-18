# Prova do guarda de iCloud (scripts/nosync.mjs). Zero dependencia, roda em
# qualquer lugar: monta um iCloud de mentira em /tmp e exercita os 9 estados.
#
# 🔴 EXISTE PORQUE A PRIMEIRA VERSAO PASSOU NUM SYMLINK QUEBRADO. O cenario 6
#    reprovou o script em 17/09: ele dava por correto um link apontando para
#    pasta inexistente — o estado exato que produz "Cannot find module" num
#    pacote instalado. Reler o codigo nao tinha pego; a prova pegou.
#
# ⛔ O cenario 3 e o mais importante e o mais facil de estragar numa
#    refatoracao: com duas arvores de node_modules o guarda precisa RECUSAR.
#    Se um dia ele "resolver sozinho" ali, apagou a instalacao de alguem.
#
#   bash scripts/nosync.test.sh
set -u
SCRIPT="$(cd "$(dirname "$0")" && pwd)/nosync.mjs"
PASSOU=0; FALHOU=0
cenario() { echo; echo "──── $1"; }
ok()   { echo "   ✅ $1"; PASSOU=$((PASSOU+1)); }
nok()  { echo "   ❌ $1"; FALHOU=$((FALHOU+1)); }
monta() {
  rm -rf "/tmp/Mobile Documents"; mkdir -p "/tmp/Mobile Documents/com~apple~CloudDocs/p/scripts"
  cp "$SCRIPT" "/tmp/Mobile Documents/com~apple~CloudDocs/p/scripts/"
  cd "/tmp/Mobile Documents/com~apple~CloudDocs/p"
}
elink() { [ -L "$1" ] && [ "$(readlink "$1")" = "$2" ]; }

cenario "1. tudo certo ja: nao pode mexer em nada"
monta; mkdir node_modules.nosync .next.nosync; ln -s node_modules.nosync node_modules; ln -s .next.nosync .next
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && elink node_modules node_modules.nosync && elink .next .next.nosync; } && ok "idempotente, exit 0" || nok "exit=$c"

cenario "2. node_modules pasta real, sem .nosync: renomeia e liga"
monta; mkdir node_modules; touch node_modules/marcador
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && elink node_modules node_modules.nosync && [ -f node_modules.nosync/marcador ]; } && ok "renomeou preservando conteudo" || nok "exit=$c"

cenario "3. node_modules com DUAS arvores: tem que RECUSAR, nao adivinhar"
monta; mkdir node_modules node_modules.nosync; touch node_modules/a node_modules.nosync/b
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 1 ] && [ -f node_modules/a ] && [ -f node_modules.nosync/b ]; } && ok "recusou e NAO apagou nada" || nok "exit=$c (esperado 1)"

cenario "4. .next com DUAS pastas: descartavel, apaga as duas e refaz"
monta; mkdir .next .next.nosync; touch .next/build .next.nosync/velho
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && elink .next .next.nosync && [ ! -f .next.nosync/velho ] && [ -z "$(ls -A .next.nosync)" ]; } && ok "apagou as duas e deixou symlink para pasta vazia" || nok "exit=$c"

cenario "5. nada existe: nao pode criar symlink quebrado"
monta
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && [ ! -e node_modules ] && [ ! -L node_modules ]; } && ok "nao inventou pasta" || nok "exit=$c, criou algo"

cenario "6. symlink QUEBRADO (aponta pro vazio)"
monta; ln -s node_modules.nosync node_modules
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && elink node_modules node_modules.nosync && [ -d node_modules.nosync ]; } && ok "criou o alvo e consertou" || nok "exit=$c"

cenario "7. copia de conflito do iCloud"
monta; mkdir node_modules.nosync "node_modules 2"; ln -s node_modules.nosync node_modules
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && [ ! -e "node_modules 2" ]; } && ok "removeu a copia de conflito" || nok "exit=$c, copia sobrou"

cenario "8. modo VERIFICACAO (sem --fix) com problema: falha e nao conserta"
monta; mkdir node_modules
node scripts/nosync.mjs >/dev/null 2>&1; c=$?
{ [ $c -eq 1 ] && [ ! -L node_modules ]; } && ok "exit 1 sem tocar em nada" || nok "exit=$c (esperado 1)"

cenario "9. FORA do iCloud (o CI): proibido mexer"
rm -rf /tmp/ci2; mkdir -p /tmp/ci2/scripts; cp "$SCRIPT" /tmp/ci2/scripts/; cd /tmp/ci2; mkdir node_modules .next
node scripts/nosync.mjs --fix >/dev/null 2>&1; c=$?
{ [ $c -eq 0 ] && [ ! -L node_modules ] && [ ! -L .next ]; } && ok "saiu na hora, nada alterado" || nok "exit=$c, mexeu em ambiente de CI"

echo; echo "════ $PASSOU passou · $FALHOU falhou ════"
[ $FALHOU -eq 0 ]
