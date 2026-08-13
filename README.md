# caaju.com.br — site

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · Vercel · Firebase

Documentação estratégica e de arquitetura em [`../docs`](../docs):
`positioning.md` · `sitemap.md` · `content-model.md` · `security-architecture.md` · `testimonials.md`

---

## Rodando localmente

```bash
cd web
cp .env.example .env.local     # preencher os valores
npm install
npm run dev                    # http://localhost:3000
```

Validação antes de commitar:

```bash
npm run typecheck
npm run build
```

### Notas de versão

- **Next.js 16** — Turbopack é o bundler padrão; `next lint` foi removido (use ESLint direto).
- **Node.js 20.9+ obrigatório.**
- **Cache é opt-in.** Nada é cacheado sem `'use cache'` explícito — comportamento desejado
  aqui, já que rotas restritas jamais podem ser cacheadas.
- **`middleware.ts` agora se chama `proxy.ts`.** O gate de acesso vive nesse arquivo.

---

## ⚠️ Este projeto está dentro do iCloud Drive

`node_modules` e `.next` somam dezenas de milhares de arquivos. Deixá-los sincronizando
no iCloud causa lentidão, conflito de sync e consumo de espaço.

**Recomendado:** mover este diretório `web/` para fora do iCloud (ex.: `~/Developer/caaju-site`)
e manter apenas `docs/` sincronizado. Ambos continuam versionados no mesmo repositório Git.

---

## Estrutura

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # metadata, JSON-LD Person, fontes, skip-link
│   │   ├── page.tsx          # home — ordem das seções = sequência de vendas
│   │   ├── globals.css       # design tokens em @theme (fonte única de verdade)
│   │   ├── not-found.tsx
│   │   ├── robots.ts         # Search bots liberados, Training bloqueados
│   │   └── sitemap.ts        # apenas rotas públicas
│   ├── components/
│   │   ├── ui/               # Button, Card, Badge, Container, Section, Signal
│   │   ├── layout/           # Header, Footer
│   │   └── sections/         # Hero, ProofBar, Problem, Services, Testimonials, FinalCta
│   ├── content/              # seed temporário — migra para Firestore
│   └── lib/                  # site config (domínio canônico), utils
└── public/
    └── llms.txt              # peça central da estratégia GEO
```

## Convenções

- **Domínio nunca hardcoded.** Sempre via `site.url` em `src/lib/site.ts`, alimentado por
  `NEXT_PUBLIC_SITE_URL`. Trocar de domínio = trocar uma variável.
- **Tokens só em `globals.css`.** Nada de hex solto em componente.
- **Server Components por padrão.** `"use client"` só quando houver estado ou evento.
- **Conteúdo restrito nunca no bundle.** Ver `docs/security-architecture.md` §0.

## Próximos passos

- [ ] `/work`, `/services`, `/about`, `/writing`, `/how-we-work`, `/call`
- [ ] Gate de cases: middleware, magic link, audit log
- [ ] Background WebGL do Hero (hoje é CSS, para não comprometer o LCP)
- [ ] Migrar conteúdo de `src/content` para Firestore
- [ ] Dashboard em `/client/insights`
