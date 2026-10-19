# Deploy NextPay na Hostinger

Guia para publicar a API + SPA na Hostinger e testar pagamentos no **Asaas Sandbox** antes de produção.

> Copie variáveis de [`.env.hostinger.example`](./.env.hostinger.example) — cada campo indica onde obter o valor no painel Asaas.

## Pré-requisitos

- Node.js **22.x** (LTS)
- PostgreSQL acessível pela aplicação (Hostinger DB ou serviço externo)
- Domínio apontando para o app (HTTPS recomendado para webhooks)

## Opção A — Hostinger “Node.js Web App”

1. **Repositório**: conecte o GitHub `ortizpedroso/NextPay` (branch `main` ou sua feature branch).
2. **Versão Node**: 22.x
3. **Comandos** (painel Hostinger):

   | Etapa | Comando |
   | :---- | :------ |
   | Instalação | `npm ci` |
   | Build | `npm run build` |
   | Start | `npm start` |

4. **Variáveis de ambiente** (cole do `.env.hostinger.example`):

   - `NODE_ENV=production`
   - `DATABASE_URL`, `APP_URL`, `JWT_SECRET`, credenciais de login
   - `MASTER_ENCRYPTION_KEY` (32 bytes Base64)
   - `ASAAS_API_KEY` (sandbox), `ASAAS_ENV=sandbox`
   - `PROCESSOR_API_BASE_URL_SANDBOX=https://sandbox.asaas.com/api/v3`
   - **Não** defina `PAYMENT_GATEWAY_MODE` (gateway HTTP real)
   - `WEBHOOK_INBOUND_SECRET` — token que você também cadastra no Asaas

5. **Migrações** (terminal SSH ou job one-shot):

   ```bash
   npx prisma migrate deploy
   ```

6. **Seed opcional do vault** (se preferir rodar antes do start):

   ```bash
   npx tsx scripts/seed-processor-vault-from-env.ts
   ```

   Com `ASAAS_API_KEY` + `MASTER_ENCRYPTION_KEY`, o servidor também grava o vault **na primeira subida** se ainda não houver credencial.

7. **Webhooks Asaas (sandbox)**:

   - URL: `https://SEU_DOMINIO/api/v1/webhooks/inbound`
   - Token no Asaas = valor de `WEBHOOK_INBOUND_SECRET`
   - Eventos recomendados: pagamentos recebidos/confirmados

8. **Smoke test**:

   ```bash
   curl -sS "https://SEU_DOMINIO/api/v1/health" || true
   ```

   (Se não houver rota health, abra `APP_URL` no navegador e faça login.)

## Opção B — VPS Hostinger (Docker)

```bash
docker build -t nextpay .
docker run --env-file .env -p 3001:3001 nextpay
```

O `Dockerfile` executa `prisma generate`, `npm run build` e `npm start` com `NODE_ENV=production`.

## Produção vs sandbox

| Cenário | `ASAAS_ENV` | `ASAAS_API_KEY` | `PROCESSOR_API_BASE_URL_*` |
| :------ | :---------- | :-------------- | :------------------------- |
| Primeiro teste na Hostinger | `sandbox` | Chave sandbox | Sandbox URL preenchida |
| Go-live | `production` | Chave produção | Produção `https://api.asaas.com/v3` |

Mantenha **white-label**: respostas públicas da API não expõem o nome do processador; use apenas variáveis internas no `.env`.

## Comandos úteis

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Troubleshooting

- **503 WEBHOOK_DISABLED**: defina `WEBHOOK_INBOUND_SECRET`.
- **401 no webhook**: token Asaas diferente do `.env` ou cabeçalho incorreto.
- **Credencial não configurada**: confira `MASTER_ENCRYPTION_KEY`, `ASAAS_API_KEY` e ausência de `PAYMENT_GATEWAY_MODE=fixture`.
- **CORS**: `APP_URL` deve ser exatamente a origem do frontend.
