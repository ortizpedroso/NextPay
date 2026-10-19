# NextPay

Painel white-label de pagamentos (Pix, cartão de crédito, boleto bancário, links de pagamento, catálogo de produtos, assinaturas e saques) voltado a prestadores de serviços e pequenos negócios brasileiros.

> **Status do Projeto**: O NextPay está atualmente em estado de protótipo em evolução por fases. As interfaces e regras de negócio estão sendo implementadas e integradas progressivamente com back-end Express, banco PostgreSQL (via Prisma ORM) e a API do Asaas. Funcionalidades ainda não implementadas em cada fase permanecem indicadas com o selo "Em breve".

---

## 💼 Modelo de Negócio

- **Subcontas Asaas por lojista**: O NextPay possui uma conta raiz no Asaas (`ASAAS_API_KEY`). Cada lojista cadastrado recebe uma subconta própria via BaaS (Banking as a Service). O valor das vendas é liquidado diretamente na subconta do respectivo lojista.
- **Comissão via Split**: O NextPay é monetizado através de comissão percentual ou fixa sobre as vendas, direcionada para a carteira da conta raiz (`NEXTPAY_WALLET_ID`) pelo split de pagamentos do Asaas.
- **Preço dos serviços sob demanda**: Para os serviços financeiros sob demanda (consultas, positivações, recargas, etc.), a regra de precificação ao lojista é estritamente: **custo cobrado pelo Asaas + R$ 0,49 por uso**.

---

## 🚀 Requisitos do Sistema

- **Node.js**: Versão 22.x LTS
- **npm**: Versão 10.x ou superior

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Backend**: Node 22, Express, TypeScript (`tsx`), Zod
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Qualidade & Testes**: ESLint (Flat Config), Prettier, Vitest, Testing Library, JSDOM
- **CI/CD**: GitHub Actions

---

## 📦 Instalação e Execução

### 1. Instalar Dependências

```bash
npm ci
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo para criar seu `.env`:

```bash
cp .env.example .env
```

### 3. Executar em Modo de Desenvolvimento

Em dois terminais (frontend Vite + API Express):

```bash
npm run dev:api
npm run dev
```

O painel ficará em `http://localhost:3000` (proxy `/api` → API na porta `3001`).

### 4. Compilar e Executar em Produção

```bash
npm run build
npm start
```

Com `NODE_ENV=production`, o Express serve o SPA em `dist/` na mesma porta (`PORT`, padrão `3001`).

### 5. Banco de Dados (PostgreSQL)

```bash
npx prisma migrate deploy
```

---

## ⚙️ Variáveis de Ambiente

As seguintes variáveis de ambiente são utilizadas pelo NextPay:

| Variável                     | Descrição                                                                 |
| :--------------------------- | :------------------------------------------------------------------------ |
| `PORT`                       | Porta do servidor Express (padrão: `3001`)                                |
| `APP_URL`                    | URL pública do painel (CORS)                                              |
| `DATABASE_URL`               | PostgreSQL principal                                                      |
| `DATABASE_URL_TEST`          | PostgreSQL para testes locais                                             |
| `PAYMENT_GATEWAY_MODE`       | `fixture` / `in_memory` = adaptador simulado (não exige vault)            |
| `MASTER_ENCRYPTION_KEY`      | 32 bytes (Base64/hex) para vault de credenciais; omita em modo `fixture`  |
| `PROCESSOR_API_BASE_URL_*`   | Base URL HTTP do processador primário (sandbox/produção)                  |
| `JWT_SECRET`                 | Assinatura JWT do lojista                                                 |
| `MERCHANT_LOGIN_EMAIL`       | E-mail de login do painel                                                 |
| `MERCHANT_LOGIN_PASSWORD`    | Senha de login (somente servidor)                                         |
| `ADMIN_API_TOKEN`            | Bearer legado para rotas administrativas                                  |
| `WEBHOOK_INBOUND_SECRET`     | Token `x-nextpay-webhook-token` nos webhooks inbound                      |
| `ASAAS_ENV`                  | `sandbox` ou `production` (ambiente padrão de webhooks/gateway)           |
| `NEXTPAY_WALLET_ID`          | Carteira NextPay para split de comissão                                   |
| `NEXTPAY_SPLIT_PERCENT`      | Percentual do split para a carteira NextPay (padrão `1`)                  |

> **Nota de Segurança**: Chaves de API e segredos só existem no servidor e são lidos via `process.env`. Nenhuma credencial é exposta ao navegador.

---

## 📜 Scripts Disponíveis

| Comando                  | Descrição                                                  |
| :----------------------- | :--------------------------------------------------------- |
| `npm run dev`            | Inicia o servidor de desenvolvimento na porta 3000         |
| `npm run build`          | Compila os assets do frontend para o diretório `dist/`     |
| `npm run preview`        | Pré-visualiza o build de produção localmente               |
| `npm run typecheck`      | Executa a verificação estática de tipos com `tsc --noEmit` |
| `npm run lint`           | Executa o ESLint para verificar padrões e problemas        |
| `npm run format`         | Formata o código com Prettier                              |
| `npm test`               | Executa os testes automatizados com Vitest                 |
| `npx prettier --check .` | Verifica a formatação de todo o projeto                    |

---

## 📐 Regras de Negócio e Convenções

1. **Valores Monetários**: Dinheiro é sempre armazenado e trafega como inteiro em centavos (`amountCents: number`). A formatação em Real ocorre exclusivamente na camada de exibição visual através da função `formatBRL(cents)` em `src/lib/format.ts`.
2. **Datas**: Trafegam em padrão ISO 8601 (UTC) e são formatadas com Intl / `pt-BR` apenas na exibição.
3. **Nomenclatura**: A marca é apresentada visualmente sempre como **NextPay**. Nomes de código seguem as convenções técnicas (`nextpay`, `NEXTPAY_...`).
