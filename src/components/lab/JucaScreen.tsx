/**
 * A tela de entrada do Juca, reproduzida dentro do /lab.
 *
 * POR QUE ELA EXISTE AQUI
 * O Juca é interno: quem entra é o time da Caáju, e só. Em vez de um link
 * solto numa lista, o /lab mostra a própria porta — a pessoa reconhece a tela
 * antes de clicar. Porta falsa é mais difícil de imitar quando a verdadeira já
 * é familiar. (ADR-029)
 *
 * 🔴 O BOTÃO NÃO AUTENTICA. Ele é um <a> para `juca.caaju.com.br/auth/login`
 *    e nada mais. Nenhum SDK do Firebase, nenhuma chamada ao Google, nenhum
 *    estado de sessão vive neste repositório. O portfólio é público e
 *    espelhado num repositório público; login do time não tem o que fazer
 *    aqui. Quem conduz o Google + o segundo fator é o próprio Juca. (ADR-029)
 *
 * 🔴 A TELA É A MESMA DO JUCA, NÃO PARECIDA. O filme é o `FilmeDePrisma` do
 *    Juca copiado, e o palco, o vidro, a marca, o título e o botão espelham
 *    `moldura.module.css` e `login/pagina.module.css` de lá, token por token.
 *    Nenhuma cor escrita aqui: o gradiente sai de `--cor-destaque`, e o
 *    `data-tema="lima"` do <html> é o mesmo do Juca. (ADR-030)
 */

import { LogoDoGoogle } from "./LogoDoGoogle";
import { PalcoDeEntrada } from "./PalcoDeEntrada";

const DESTINO = "https://juca.caaju.com.br/auth/login";

export function JucaScreen() {
  return (
    <PalcoDeEntrada>
      <span className="entrada-marca" aria-hidden="true">
        J
      </span>
      <h2 className="entrada-titulo">Juca</h2>
      <p className="entrada-apagado">BPO Financeiro da Caáju</p>

      {/* Branco com contorno e o logo do Google, como no Juca. Navega: é <a>, não <button>. */}
      <a href={DESTINO} className="entrada-acao">
        <LogoDoGoogle />
        Entrar com Google
      </a>

      <p className="entrada-apagado entrada-miudo">
        Depois do Google, o painel pede o código do seu app autenticador.
      </p>
    </PalcoDeEntrada>
  );
}
