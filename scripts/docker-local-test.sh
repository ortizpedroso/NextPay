#!/usr/bin/env bash
# Smoke test local: Postgres (docker compose) + migrations + test suite + API health.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export DATABASE_URL="${DATABASE_URL:-postgresql://nextpay:nextpay_local@localhost:5432/nextpay?schema=public}"
export DATABASE_URL_TEST="${DATABASE_URL_TEST:-postgresql://nextpay:nextpay_local@localhost:5432/nextpay?schema=public}"
export NODE_ENV="${NODE_ENV:-test}"
export PAYMENT_GATEWAY_MODE="${PAYMENT_GATEWAY_MODE:-fixture}"
export JWT_SECRET="${JWT_SECRET:-local-dev-jwt-secret-min-16-chars}"
export MERCHANT_LOGIN_EMAIL="${MERCHANT_LOGIN_EMAIL:-lojista@nextpay.test}"
export MERCHANT_LOGIN_PASSWORD="${MERCHANT_LOGIN_PASSWORD:-local-dev-password}"

echo "==> Subindo PostgreSQL (docker compose)..."
docker compose up -d

echo "==> Aguardando Postgres..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U nextpay -d nextpay >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose exec -T postgres pg_isready -U nextpay -d nextpay

echo "==> Dependências..."
npm ci

echo "==> Prisma generate + migrate deploy..."
npx prisma generate
npx prisma migrate deploy

echo "==> Testes (Vitest)..."
npm test

echo "==> Typecheck, lint, build..."
npm run typecheck
npm run lint
npm run build

echo "==> Smoke API (fixture, sem MASTER_ENCRYPTION_KEY)..."
PORT=3001 PAYMENT_GATEWAY_MODE=fixture node --import tsx server/index.ts &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT
sleep 2
curl -sf "http://127.0.0.1:3001/api/v1/health" | head -c 200
echo ""
echo "OK: health check passou."

echo ""
echo "==> Concluído. Para painel + API em dev:"
echo "    docker compose up -d"
echo "    cp .env.example .env   # ajuste DATABASE_URL se necessário"
echo "    npx prisma migrate deploy"
echo "    npm run dev:api   # terminal 1"
echo "    npm run dev       # terminal 2"
