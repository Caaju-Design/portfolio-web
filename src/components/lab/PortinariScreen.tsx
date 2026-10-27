import { LogoDoGoogle } from "./LogoDoGoogle";
import { PalcoDeEntrada } from "./PalcoDeEntrada";

/**
 * A tela de entrada do Portinari, reproduzida dentro do /lab. (ADR-031)
 *
 * MESMA MANOBRA DO JUCA, COM UMA DIFERENÇA DE DESTINO
 * O Juca conduz o próprio login. O Portinari entra pelo Firebase com Google
 * (e e-mail e senha), e isso já funciona em `portinari.caaju.com.br/auth/login`.
 * Então todo gesto desta tela leva para lá, e é LÁ que o Firebase abre o
 * Google. O portfólio não inicia login de ninguém: a sessão do Firebase é
 * presa ao domínio que a abriu, e uma sessão aberta aqui seria do portfólio,
 * não do Portinari.
 *
 * 🔴 NENHUMA SENHA PASSA POR AQUI. Os campos de e-mail e senha do Portinari
 *    aparecem como DESENHO — são links com cara de campo, não <input>. Campo
 *    de senha de verdade num site que não é o do produto é exatamente o
 *    formato de um phishing, e treinaria o time a digitar a senha do
 *    Portinari fora do Portinari. Clicar em qualquer um leva ao login real.
 *
 * 🔴 O FUNDO É O NOSSO, NÃO O DO PORTINARI DE HOJE. Desde 17/10 o Portinari usa
 *    o "Prism Film" da Originkit, código pago e licenciado para a conta do
 *    ADM. Este repositório é espelhado num repositório PÚBLICO: copiar o
 *    componente de lá seria publicar código licenciado. O `FilmeDePrisma`
 *    daqui é a versão própria da Caáju, a que o Portinari usava antes e o Juca
 *    usa hoje — mesma família, mesmas cores do tema.
 */

const DESTINO = "https://portinari.caaju.com.br/auth/login";

export function PortinariScreen() {
  return (
    <PalcoDeEntrada>
      <span className="entrada-marca" aria-hidden="true">
        P
      </span>
      <h2 className="entrada-titulo">PORTINARI</h2>
      <p className="entrada-apagado">Design System da Caáju</p>

      {/* O Google em branco com contorno; a ação VERDE é o "Entrar" — como lá. */}
      <a href={DESTINO} className="entrada-acao">
        <LogoDoGoogle />
        Entrar com Google
      </a>

      <div className="entrada-separador" role="separator">
        <span>ou</span>
      </div>

      <div className="entrada-formulario">
        {/* Desenho de campo, não campo: ver o bloco no topo. */}
        <a href={DESTINO} className="entrada-campo">
          <span className="entrada-rotulo">E-mail</span>
          <span className="entrada-caixa" aria-hidden="true" />
        </a>
        <a href={DESTINO} className="entrada-campo">
          <span className="entrada-rotulo">Senha</span>
          <span className="entrada-caixa" aria-hidden="true" />
        </a>
        <a href={DESTINO} className="entrada-acao entrada-acao-destaque">
          Entrar
        </a>
      </div>

      <p className="entrada-apagado entrada-miudo">
        Recebeu um convite? Entre pelo botão do e-mail para criar sua senha.{" "}
        <a href="https://portinari.caaju.com.br/auth/esqueci-a-senha" className="underline underline-offset-4">
          Esqueci minha senha
        </a>
      </p>
    </PalcoDeEntrada>
  );
}
