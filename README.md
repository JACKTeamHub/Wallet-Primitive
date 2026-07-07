# Wallet Primitive — Frontend

Developer-first frontend for Wallet Primitive, a BaaS layer over the Nomba APIs.
Next.js 15 (App Router) · TypeScript strict · Tailwind · TanStack Query · Framer Motion + GSAP.

## What's built (Phase 1)

- **Marketing site** (`src/app/page.tsx`): hero, animated background, multi-language
  interactive code window with copy buttons, live JSON response panel, GSAP terminal
  animation, browser mockups, API flow diagram, feature cards, architecture diagram,
  docs preview linking to the Mintlify docs, SDK cards, a fake playground, testimonials,
  FAQ accordion, final CTA.
- **Auth** (`src/app/(auth)`): signup and login, each a two-step email → OTP flow,
  React Hook Form + Zod validated, calling the workspaces auth endpoints. No JWT in
  localStorage — cookies are `withCredentials` on the Axios client.
- **Dashboard shell** (`src/app/dashboard`): sidebar-nested layout with one route per
  backend module — overview, customers, wallets, temporary accounts, webhooks,
  analytics, audit logs, reconciliation, settings (credentials, API keys, webhook
  simulator). Every list view has a loading skeleton, an empty state, and an error
  state, wired through TanStack Query against the typed Axios clients in `src/api`.
- **API layer** (`src/api`): one file per backend module, matching every endpoint in
  the spec 1:1. All amounts are typed as integer kobo (`src/types/domain.ts`).

## Not yet built (flagged for a follow-up pass)

- Wallet detail page (ledger table, statement date-range picker defaulting to last
  30 days, PDF statement download, transfer flow, KYC tier editor with NIN/BVN/proof-
  of-address inputs).
- Temporary account creation modal and detail page.
- Customer detail page + rename flow.
- Quarantine ledger view.
- Toast notifications, confirmation dialogs for destructive actions (revoke key,
  freeze wallet), and keyboard-nav polish across tables.
- Dark/light toggle control in the UI (the provider is wired, but there's no switch
  yet).

## Running it

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to your NestJS backend
npm run dev
```

## Folder architecture

```
src/
  app/            routes: (marketing) at "/", (auth) at /signup /login, /dashboard/*
  api/            one typed Axios module per backend resource
  components/     ui/ (primitives), landing/ (marketing sections), layout/ (shell)
  features/       feature-scoped hooks (currently: auth)
  providers/      React Query + theme providers
  schemas/        Zod schemas for forms
  types/          shared domain types (Wallet, Customer, LedgerEntry, ...)
  utils/          cn() className helper
  constants/      landing page code samples
```
