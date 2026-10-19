# NextPay implementation decisions

This document records product and technical choices for the full-implementation workstream (`cursor/full-implementation-59eb`).

## Status checklist

- [x] Phase A: Branch, DECISIONS.md, docker-compose, admin merchant onboarding
- [ ] Phase B: Withdrawals (Prisma), JWT withdraw, subscription job security, rate limit
- [ ] Phase C: Shell login, subscriptions CRUD UI, profile/balance from API, dashboard cleanup
- [ ] Phase D: Integrations connect/disconnect, WooCommerce inbound webhook stub
- [ ] Phase E: P2 minimal pages (Antecipação, Tap, NF)
- [ ] Phase F: CI e2e, README, final checklist

## Defaults (coordinator)

| Topic | Decision |
| --- | --- |
| Tenancy | SaaS multi-merchant; onboarding via `POST /api/v1/admin/merchants` (admin token) |
| Withdrawals | `WithdrawalRequest` in Prisma + adapter; PRODUCTION vault → real call; else simulated COMPLETED after delay in fixture |
| Login UX | `MerchantSessionBar` in app shell header (not only integrations page) |
| Subscriptions job | `POST /api/v1/jobs/process-subscription-renewals` with internal token only |
| Integrations | POST connect/disconnect per platform → `MerchantIntegration` |
| Public checkout | `express-rate-limit` on public routes |
| P2 pages | Minimal real pages + API stubs (Antecipação quote, Tap device register, NF emit request) |
| Profile mock | Limit `NEXTPAY_ACCOUNT`; profile from `GET /api/v1/merchant/auth/me` |
| E2E | Playwright chromium in CI |
| Local DB | `docker-compose.yml` for PostgreSQL |
| Withdraw modal | Works with merchant JWT (not admin-only) |
| Hosted card | Remains stub; PCI scope documented in README |
| Demo mode | Keep `VITE_DEMO_MODE`; default `false` in production builds |
