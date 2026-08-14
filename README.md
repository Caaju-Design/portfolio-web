# caaju.com.br

Portfolio and client workspace for **Emanuel Caáju** — Fractional Product Design Lead.

Public case studies, gated deep dives for prospective clients, and native call
scheduling. Built as a product, not as a template.

**Stack** · Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 ·
Firebase (Firestore + Auth) · Google Calendar API · Vercel

---

## Why this repository exists

Most design portfolios are a slide deck with a domain. This one is a working
product with authentication, an audit trail, data-retention policies and a
deployment pipeline — because the way something is built is itself an argument
about how its author works.

It is a public mirror of the application code. Strategy, architecture notes and
infrastructure live in a private repository and are synced out deliberately:
only `web/` is published.

---

## Architecture worth a look

**The database denies everything by default.** `firestore.rules` is a blanket
`allow read, write: if false`. No client SDK ever touches Firestore — every read
and write goes through the Admin SDK on the server. The classic Firebase
horror story is an open rule paired with a client SDK; that vector does not
exist here, and cannot be reintroduced by a front-end regression.

**Case study deep dives are gated, and the gate is server-authoritative.**
Access is requested by email, granted by magic link, and verified in a Server
Component before any restricted content is rendered. The edge proxy
(`src/proxy.ts`) is a fast rejection layer, not the source of truth — a proxy
that can be bypassed should never be the thing holding the door.

**Content under NDA never reaches the client bundle.** Restricted routes ship
`noindex, noarchive`, `Cache-Control: private, no-store`, and no referrer.

**Scheduling is native.** `/call` reads real availability from Google Calendar
and writes the event directly — no third-party booking widget, no visitor data
handed to a scheduling vendor.

**Data has an expiry date by design.** Firestore TTL policies remove leads,
access logs and rate-limit records automatically once their retention window
closes. Automatic indexing is disabled per collection and re-enabled only for
the fields actually queried — the same deny-by-default posture as the security
rules, applied to indexes.

**Rate limiting fails closed.** If the limiter cannot evaluate a request, the
request is denied. An unavailable safety mechanism is not a reason to skip the
check.

**Every push is verified.** GitHub Actions runs a type check and a full-history
secret scan on each commit. Production is promoted only when both pass.

---

## Running locally

```bash
cp .env.example .env.local     # fill in the values
npm ci
npm run dev                    # http://localhost:3000
```

Before committing:

```bash
npm run typecheck
npm run build
```

Diagnostics, when something upstream misbehaves:

```bash
npm run check-env              # environment variable format
npm run check-firebase         # Admin SDK credentials and connectivity
npm run check-calendar         # Google Calendar access
npm run check-indexes          # Firestore indexes and TTL policies
```

---

## Structure

```
src/
├── app/
│   ├── page.tsx               home — section order is the sales sequence
│   ├── work/                  case studies, public index and gated deep dives
│   ├── access/                email request and magic-link verification
│   ├── call/                  scheduling against real calendar availability
│   ├── client/                private client area
│   ├── api/                   access and booking endpoints
│   ├── globals.css            design tokens — the single source of truth
│   ├── robots.ts              search bots allowed, training crawlers blocked
│   └── sitemap.ts             public routes only
├── components/                ui, layout and page sections
├── content/                   seed content, migrating to Firestore
├── lib/                       Firebase, auth, booking, rate limiting, audit
└── proxy.ts                   edge access gate
```

## Conventions

- **The domain is never hardcoded.** Always `site.url`, fed by
  `NEXT_PUBLIC_SITE_URL`. Changing domains means changing one variable.
- **Design tokens live only in `globals.css`.** No loose hex values in
  components.
- **Server Components by default.** `"use client"` only for state or events.
- **Opacity modifiers are banned on text colors.** They read as a visual tweak
  and are in fact a contrast change — one that no linter catches. Three fixed
  levels instead, all passing WCAG AA.

---

## Built with an AI pair

This project was designed and built by Emanuel Caáju working with Claude:
architecture decisions, implementation, security review and infrastructure.
Every decision is recorded as an ADR — including the ones that were reversed,
and what they cost.
