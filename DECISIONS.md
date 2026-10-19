# NextPay implementation decisions

This document records product and technical choices for the full-implementation workstream (`cursor/full-implementation-59eb`).

## Status checklist

- [x] Phase A: Branch, DECISIONS.md, docker-compose, admin merchant onboarding
- [x] Phase B: Withdrawals (Prisma), JWT withdraw, subscription job security, rate limit
- [x] Phase C: Shell login, subscriptions CRUD UI, profile/balance from API, dashboard cleanup
- [x] Phase D: Integrations connect/disconnect, WooCommerce inbound webhook stub
- [x] Phase E: P2 minimal pages (Antecipação, Tap, NF)
- [x] Phase F: CI e2e, README, final checklist

## Defaults (coordinator)

| Topic             | Decision                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tenancy           | SaaS multi-merchant; onboarding via `POST /api/v1/admin/merchants` (admin token)                                       |
| Withdrawals       | `WithdrawalRequest` in Prisma + adapter; PRODUCTION vault → real call; else simulated COMPLETED after delay in fixture |
| Login UX          | `MerchantSessionBar` in app shell header (not only integrations page)                                                  |
| Subscriptions job | `POST /api/v1/jobs/process-subscription-renewals` with internal token only                                             |
| Integrations      | POST connect/disconnect per platform → `MerchantIntegration`                                                           |
| Public checkout   | `express-rate-limit` on public routes                                                                                  |
| P2 pages          | Minimal real pages + API stubs (Antecipação quote, Tap device register, NF emit request)                               |
| Profile mock      | Limit `NEXTPAY_ACCOUNT`; profile from `GET /api/v1/merchant/auth/me`                                                   |
| E2E               | Playwright chromium in CI                                                                                              |
| Local DB          | `docker-compose.yml` for PostgreSQL                                                                                    |
| Withdraw modal    | Works with merchant JWT (not admin-only)                                                                               |
| Hosted card       | Remains stub; PCI scope documented in README                                                                           |
| Demo mode         | Keep `VITE_DEMO_MODE`; default `false` in production builds                                                            |

## Implementation notes

- **Subagents**: Coordinator executed backend / frontend / platform work sequentially on branch `cursor/full-implementation-59eb` (no parallel Task API in this environment).
- **Admin onboarding**: `onboardMerchant()` generates `np_merchant_*` public id; sandbox vault placeholder skipped when `PAYMENT_GATEWAY_MODE=fixture`.
- **Withdrawals**: `WithdrawalRequest` Prisma model with in-memory stub fallback when DB unavailable (unit tests). Fixture adapter auto-completes after ~5s on GET.
- **Subscription renewals**: Removed from `/api/v1/subscriptions/jobs/*`; only `/api/v1/jobs/process-subscription-renewals` behind `INTERNAL_JOB_TOKEN` or admin bearer.
- **Rate limits**: 60 req/min checkout, 120 req/min other `/api/v1/public/*`.
- **Integrations**: `POST .../:platform/connect|disconnect` upserts `MerchantIntegration`.
- **Woo webhook**: `POST /api/v1/webhooks/inbound/woocommerce` with `x-nextpay-webhook-token`, idempotent stub ack.
- **P2 APIs**: `/api/v1/services/antecipacao/quote`, `/tap/devices`, `/notas-fiscais/emit` — all return `stub: true`.
- **Profile UI**: `GET /api/v1/merchant/auth/me` drives saldo, email, merchant id; `NEXTPAY_ACCOUNT` only when `VITE_DEMO_MODE=true`.
- **PCI**: Documented in README — hosted card stub, no PAN storage.
