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
- **Dashboard & Core Console Features** (`src/app/dashboard`):
  * **Overview & Analytics**: Interactive charts showing daily transaction volumes and chronological 7-day volumetric activity.
  * **Wallets & Ledgers**: Deep-dive details for customer wallets, full double-entry transaction ledgers, transfer modals, and CBN KYC compliance verification (Tier 1/2/3).
  * **Temporary Checkout Accounts**: Create, configure, and monitor temporary accounts for incoming checkout flows.
  * **Reconciliation & Quarantine**: View quarantined funds and execute admin overrides to either `release` or `reject` funds.
  * **Webhook Simulator**: Trigger sandbox payment notifications for customer wallets and active temporary checkout accounts.
  * **Webhooks & Audit Logs**: Interactive list of inbound webhook notifications with color-coded, formatted JSON payloads, alongside a responsive audit timeline tracking developer console actions.

## 👥 Demo Logins & Test Accounts

You can log in to the **Developer Console Web UI** using the following pre-seeded workspace accounts:

* **Password for all accounts**: `password123`
* **Workspace Emails**:
  * 🍔 **Chowdeck**: `dev@chowdeck.com`
  * 🛍️ **Jumia**: `dev@jumia.com`
  * 🚚 **GIG Logistics**: `dev@giglogistics.com`

---

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
