"use client";

/**
 * O fundo em movimento das telas de entrada — fitas de seda dobradas, com borda cromática.
 *
 * ## Cópia do Juca, de propósito (27/10)
 *
 * Este arquivo é o `painel/components/entrada/FilmeDePrisma.tsx` do repositório do Juca, que
 * por sua vez veio do Portinari (`apps/studio/app/auth/`). No /lab ele reproduz a porta do
 * Juca, e a porta só é reconhecível se for a MESMA — recriar o efeito à mão foi o que deixou
 * a primeira versão (PR #11) com outra cara. A única mudança é o `.module.css`, que virou
 * classe Tailwind no canvas: o portfólio não usa CSS Modules (ver `Button.tsx`). ADR-030.
 *
 * ⚠️ Se o efeito mudar lá, ele muda aqui copiando de novo — não ajustando à mão.
 *
 * ## De onde veio (16/10)
 *
 * O ADM apontou o "Prism Film" da Originkit como referência: *"quero que você use esse
 * background"*, *"trabalhe no gradiente para que ele fique com as cores do tema"*.
 *
 * ⛔ **Implementação NOSSA, e não cópia.** O código do componente de lá é pago e licenciado; o
 *    que existe aqui foi escrito a partir da DESCRIÇÃO pública do efeito — camadas de plano
 *    dobradas por senos, brilho por inverso do quadrado, separação de vermelho e azul num eixo
 *    que gira. Nenhuma linha deles entrou.
 *
 * ## As cores são as do tema, lidas do CSS
 *
 * `--cor-destaque` (que muda com `data-tema`: lima, ciano, lilás…) é a ponta da rampa, e o
 * fundo é `--fundo-do-filme`, que a moldura define. Lidas por `getComputedStyle` ao montar e a
 * cada mudança de tema/modo no `<html>` — um número escrito aqui seria a segunda fonte que
 * diverge da primeira (`§6.1`).
 *
 * ## O que ele NÃO faz
 *
 * - ⛔ Não anima para quem pediu menos movimento (`prefers-reduced-motion`): desenha um quadro
 *   parado, e fica nele.
 * - ⛔ Não trava quem não tem WebGL: sem contexto, o canvas some e fica o gradiente de CSS da
 *   moldura por baixo.
 * - ⚠️ Desenha em METADE da resolução e o navegador amplia: o efeito é desfocado por natureza,
 *   e o custo cai a um quarto. O laço para sozinho com a aba escondida (`requestAnimationFrame`).
 */

import { useEffect, useRef } from "react";

const VERTICES = `
attribute vec2 posicao;
void main() { gl_Position = vec4(posicao, 0.0, 1.0); }
`;

/**
 * O campo: `CAMADAS` faixas, cada uma o plano girado e cisalhado por um ângulo próprio, com a
 * linha central ondulada por dois senos. Cada faixa soma um brilho que cai com o quadrado da
 * distância — perto da linha é luz, longe é o fundo.
 */
/** O zoom da composição, um lugar só: o shader e o ponteiro usam o mesmo. */
const ZOOM = 1.0;

const FRAGMENTOS = `
precision highp float;
uniform vec2 resolucao;
uniform float tempo;
uniform vec3 cor1;
uniform vec3 cor2;
uniform vec3 cor3;
uniform vec3 fundo;
uniform vec2 ponteiro;
uniform float presenca;
uniform float claridade;

const int FOLHAS = 9;

// Uma folha de seda: o plano girado, cisalhado e dobrado por dois senos. Ela devolve um CORPO
// largo e macio (a seda) e um FIO estreito e claro (a dobra que pega luz) — é o par que faz a
// referência ler como tecido, e não como linhas.
vec3 campo(vec2 p, float t) {
  vec3 soma = vec3(0.0);
  for (int i = 0; i < FOLHAS; i++) {
    float fi = float(i);
    float k = fi / float(FOLHAS - 1);
    float a = 0.5 + k * 0.55 + 0.12 * sin(t * 0.11 + fi * 1.3);
    float c = cos(a);
    float s = sin(a);
    vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    q.x += q.y * 0.4 * sin(fi * 0.7 + t * 0.04);
    float onda = 0.34 * sin(q.x * 0.85 + t * 0.22 + fi * 0.9)
               + 0.14 * sin(q.x * 1.9 - t * 0.17 + fi * 1.7);
    float d = q.y - onda - (k - 0.5) * 1.35;
    float corpo = exp(-d * d * 9.0);
    float fio = exp(-d * d * 320.0);
    // A cor desliza ao longo da folha: o brilho troca de tom conforme ela dobra.
    float brilho = 0.5 + 0.5 * sin(q.x * 1.3 + t * 0.3 + fi);
    vec3 tom = mix(mix(cor1, cor2, k), cor3, brilho * 0.35);
    soma += tom * (corpo * 0.22 + fio * 0.9);
  }
  return soma / 3.0;
}

void main() {
  float lado = min(resolucao.x, resolucao.y);
  // O zoom da composição (ZOOM, no TS) — medido em 17/10: abaixo de 1, a separação maior misturava
  // vermelho demais no verde e o quadro ficava oliva.
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolucao) / lado * ${ZOOM.toFixed(2)};
  float t = tempo;
  // Perto do ponteiro a separação ALARGA e a luz acende — a "brincadeira do hover" da referência.
  float perto = presenca * exp(-dot(uv - ponteiro, uv - ponteiro) * 7.0);
  float eixo = t * 0.12 + uv.y * 0.9 + ponteiro.x * 0.8;
  vec2 desvio = vec2(cos(eixo), sin(eixo)) * (0.025 + 0.06 * perto);
  float r = campo(uv + desvio, t).r;
  vec3 g = campo(uv, t);
  float b = campo(uv - desvio, t).b;
  // O véu: a seda ocupa uma diagonal que deriva devagar, e o resto fica no escuro — como na
  // referência, onde metade do quadro é fundo. Sem ele, as folhas cobrem tudo e a cor satura.
  vec2 rumo = vec2(cos(t * 0.05 + 2.2), sin(t * 0.05 + 2.2));
  float veu = smoothstep(-0.75, 0.55, dot(uv, rumo) + 0.25 * sin(uv.x * 1.3 + t * 0.07));
  vec3 luz = vec3(r, g.g, b) * veu + cor3 * perto * 0.2;
  luz = 1.0 - exp(-luz * 1.5);
  vec3 sobreEscuro = 1.0 - (1.0 - fundo) * (1.0 - luz);
  vec3 sobreClaro = fundo * (1.0 - luz * (1.0 - mix(cor1, cor2, 0.5)));
  gl_FragColor = vec4(mix(sobreEscuro, sobreClaro, claridade), 1.0);
}
`;

/** `#rgb`, `#rrggbb` ou `rgb(r, g, b)` → [0..1]×3. `null` quando não reconhece. */
function corDoCss(valor: string): readonly [number, number, number] | null {
  const v = valor.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex !== null) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join("") : hex[1]!;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as unknown as readonly [number, number, number];
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(v);
  if (rgb !== null) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  return null;
}

/** Gira a matiz de uma cor RGB [0..1] por `voltas` (1 = o círculo inteiro), mantendo S e L. */
function girarMatiz(cor: readonly [number, number, number], voltas: number): [number, number, number] {
  const [r, g, b] = cor;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [r, g, b];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (((h / 6 + voltas) % 1) + 1) % 1;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] = h < 1 / 6 ? [c, x, 0] : h < 2 / 6 ? [x, c, 0] : h < 3 / 6 ? [0, c, x] : h < 4 / 6 ? [0, x, c] : h < 5 / 6 ? [x, 0, c] : [c, 0, x];
  return [r1 + m, g1 + m, b1 + m];
}

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string): WebGLShader | null {
  const s = gl.createShader(tipo);
  if (s === null) return null;
  gl.shaderSource(s, fonte);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) === true ? s : null;
}

export function FilmeDePrisma() {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dono = caixa.current;
    if (dono === null) return;
    /**
     * 🔴 **Um `<canvas>` NOVO a cada montagem, criado aqui e não no JSX.** A limpeza devolve o
     *    contexto ao navegador (`loseContext`), e `getContext` num canvas cujo contexto foi
     *    perdido devolve o MESMO contexto, morto: tudo depois falha calado. Em desenvolvimento o
     *    React monta, desmonta e monta de novo — e o fundo nascia escondido (16/10). Com um
     *    canvas por montagem, o contexto perdido some junto com o elemento dele.
     */
    const canvas = document.createElement("canvas");
    // O canvas ocupa o palco inteiro, por trás do conteúdo. O tamanho de DESENHO (metade) é
    // daqui; a classe é só o tamanho de exibição.
    canvas.className = "pointer-events-none absolute inset-0 block size-full";
    canvas.setAttribute("aria-hidden", "true");
    dono.append(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (gl === null) {
      canvas.remove();
      return;
    }
    const vs = compilar(gl, gl.VERTEX_SHADER, VERTICES);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS);
    const programa = gl.createProgram();
    if (vs === null || fs === null || programa === null) {
      canvas.remove();
      return;
    }
    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    if (gl.getProgramParameter(programa, gl.LINK_STATUS) !== true) {
      canvas.remove();
      return;
    }
    gl.useProgram(programa);

    // Um triângulo que cobre a tela inteira: três vértices, sem buffer de índices.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posicao = gl.getAttribLocation(programa, "posicao");
    gl.enableVertexAttribArray(posicao);
    gl.vertexAttribPointer(posicao, 2, gl.FLOAT, false, 0, 0);

    const u = (nome: string) => gl.getUniformLocation(programa, nome);
    const uResolucao = u("resolucao");
    const uTempo = u("tempo");
    const uCor1 = u("cor1");
    const uCor2 = u("cor2");
    const uFundo = u("fundo");
    const uCor3 = u("cor3");
    const uPonteiro = u("ponteiro");
    const uPresenca = u("presenca");
    const uClaridade = u("claridade");

    // ⚠️ Declarados ANTES dos observadores: o `ResizeObserver` dispara já no `observe()`, e um
    //    `const` usado antes da linha que o declara é erro em tempo de execução (TDZ).
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // O ponteiro inclina o eixo da separação, com atraso — a luz segue a mão, não a pula.
    // Em coordenadas do shader (o lado menor vale 1, y para cima); `presenca` acende ao entrar.
    const alvo = { x: 0, y: 0, presenca: 0 };
    const atual = { x: 0, y: 0, presenca: 0 };
    const desenhar = (ms: number): void => {
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      atual.presenca += (alvo.presenca - atual.presenca) * 0.05;
      gl.uniform1f(uTempo, ms / 1000);
      gl.uniform2f(uPonteiro, atual.x, atual.y);
      gl.uniform1f(uPresenca, atual.presenca);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /** As cores do tema, do CSS — de novo a cada troca de tema ou de modo. */
    const lerCores = (): void => {
      const css = getComputedStyle(dono);
      const destaque = corDoCss(css.getPropertyValue("--cor-destaque")) ?? [0.89, 1, 0];
      const fundo = corDoCss(css.getPropertyValue("--fundo-do-filme")) ?? [0.06, 0.06, 0.08];
      // A rampa sai TODA do destaque do tema: ele, ele girado no círculo de cores (o vizinho
      // frio — no lima, um verde-esmeralda/água) e ele clareado (o brilho da dobra). Trocar de tema troca
      // a paleta inteira, sem número de cor escrito aqui.
      const vizinho = girarMatiz(destaque, 0.22);
      const claro = destaque.map((c) => c + (1 - c) * 0.6);
      gl.uniform3f(uCor1, destaque[0], destaque[1], destaque[2]);
      gl.uniform3f(uCor2, vizinho[0], vizinho[1], vizinho[2]);
      gl.uniform3f(uCor3, claro[0]!, claro[1]!, claro[2]!);
      gl.uniform3f(uFundo, fundo[0], fundo[1], fundo[2]);
      const luminancia = 0.2126 * fundo[0] + 0.7152 * fundo[1] + 0.0722 * fundo[2];
      gl.uniform1f(uClaridade, luminancia > 0.5 ? 1 : 0);
    };
    lerCores();
    const observador = new MutationObserver(() => {
      lerCores();
      if (parado) desenhar(0);
    });
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema", "data-modo"] });

    // Metade da resolução: o efeito é desfocado por natureza, e o custo cai a um quarto.
    const ajustar = (): void => {
      const largura = Math.max(1, Math.round(canvas.clientWidth * 0.5));
      const altura = Math.max(1, Math.round(canvas.clientHeight * 0.5));
      if (canvas.width !== largura || canvas.height !== altura) {
        canvas.width = largura;
        canvas.height = altura;
        gl.viewport(0, 0, largura, altura);
      }
      gl.uniform2f(uResolucao, largura, altura);
    };
    const redimensionar = new ResizeObserver(() => {
      ajustar();
      if (parado) desenhar(0);
    });
    redimensionar.observe(canvas);

    const mover = (e: PointerEvent): void => {
      const r = canvas.getBoundingClientRect();
      const lado = Math.min(r.width, r.height);
      const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      // O mesmo zoom do shader (`ZOOM`): o brilho acende ONDE o ponteiro está.
      alvo.x = ((e.clientX - r.left - r.width / 2) / lado) * ZOOM;
      alvo.y = (-(e.clientY - r.top - r.height / 2) / lado) * ZOOM;
      alvo.presenca = dentro ? 1 : 0;
    };
    window.addEventListener("pointermove", mover, { passive: true });

    ajustar();
    let quadro = 0;
    if (parado) {
      desenhar(0);
    } else {
      const laco = (ms: number): void => {
        desenhar(ms);
        quadro = requestAnimationFrame(laco);
      };
      quadro = requestAnimationFrame(laco);
    }

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      redimensionar.disconnect();
      window.removeEventListener("pointermove", mover);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  // Decoração: nada aqui é conteúdo, e o leitor de tela não precisa saber que existe.
  return <div ref={caixa} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
