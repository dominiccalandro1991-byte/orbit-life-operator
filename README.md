# Orbit — Life Operator

Next.js App Router product for turning captured thoughts into planned work.

## Stack

- Next.js 16 App Router + TypeScript
- Better Auth (email/password)
- Neon Postgres via Drizzle
- Stripe Checkout + webhooks (503 until `STRIPE_WEBHOOK_SECRET` is set)
- AI SDK generation route with server-side token entitlements
- Deterministic planning engine (`lib/planning-engine.ts`)

## Local

1. Copy `.env.example` to `.env.local`
2. Apply `schema.sql` on Neon
3. `pnpm install && pnpm dev`

## Billing rule

If `STRIPE_WEBHOOK_SECRET` is unset, `/api/checkout` and `/api/stripe/webhook` return HTTP 503 (`Billing setup pending`). Pro is never granted from a client flag.
