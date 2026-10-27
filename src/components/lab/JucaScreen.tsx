/**
 * A tela de entrada do Juca, reproduzida dentro do /lab.
 *
 * POR QUE ELA EXISTE AQUI
 * O Juca é interno: quem entra é o time da Caáju, e só. Em vez de um link
 * solto numa lista, o /lab mostra a própria porta — a pessoa reconhece a tela
 * antes de clicar. É a mesma ideia do "known-good screen" de banco: a porta
 * falsa é mais difícil de imitar quando a porta verdadeira já é familiar.
 *
 * 🔴 O BOTÃO NÃO AUTENTICA. Ele é um <a> para `juca.caaju.com.br` e nada mais.
 *    Nenhum SDK do Firebase, nenhuma chamada ao Google, nenhum estado de
 *    sessão vive neste repositório. O portfólio é público e espelhado num
 *    repositório público; login do time não tem o que fazer aqui. Quem conduz
 *    o Google + o segundo fator é o próprio Juca, no domínio dele. (ADR-029)
 *
 * 🔴 EXCEÇÃO DE COR CONSCIENTE. O gradiente e o vidro são a identidade do
 *    JUCA, não a do portfólio — por isso não saem dos tokens do caaju-ui. Eles
 *    moram num único lugar, a utility `juca-aurora` do globals.css, com a
 *    mesma justificativa escrita lá. Nada aqui é hex solto.
 */

const DESTINO = "https://juca.caaju.com.br";

function GoogleG() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5 shrink-0">
      <path
        fill="#ffc107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#ff3d00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4caf50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976d2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 41.2 44 36 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

export function JucaScreen() {
  return (
    <div className="juca-aurora relative flex min-h-[32rem] items-center justify-center overflow-hidden rounded-(--radius-card) p-6 md:min-h-[38rem]">
      <div aria-hidden className="juca-rays pointer-events-none absolute -inset-24" />
      <div aria-hidden className="juca-vignette pointer-events-none absolute inset-0" />

      <div className="juca-glass relative w-full max-w-sm rounded-(--radius-card) p-8 text-center">
        <span className="juca-logo mx-auto flex size-12 items-center justify-center rounded-2xl font-display text-sm font-semibold">
          J
        </span>

        <h2 className="mt-5 font-display text-h1 font-semibold tracking-tight text-white">Juca</h2>
        <p className="mt-1 text-sm text-white/70">BPO Financeiro da Caáju</p>

        <a
          href={DESTINO}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-(--radius-button) bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-90"
        >
          <GoogleG />
          Entrar com Google
        </a>

        <p className="mt-4 text-xs leading-relaxed text-white/60 text-pretty">
          Depois do Google, o painel pede o código do seu app autenticador.
        </p>
      </div>
    </div>
  );
}
