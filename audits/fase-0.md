# Auditoria — Fase 0

Commit auditado: `655309b` (`main`) · Resultado: **reprovada, com correções**

## O que eu rodei

| Verificação | Resultado |
|---|---|
| `npm ci` (sem `--legacy-peer-deps`) | ✅ |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ (mas com regras importantes desligadas, ver item 4) |
| `npm test` | ✅ 10 testes |
| `npm run build` | ✅ (aviso de bundle > 500 kB) |
| Nome "NexusPay" removido de `src/`, `index.html`, `metadata.json` | ✅ |
| `esbuild` e `@google/genai` removidos, `import.meta.dirname` no Vite | ✅ |

## Problemas encontrados

### Bloqueantes

1. **CI não existe.** Não há `.github/workflows/ci.yml`, mas o README afirma "CI/CD: GitHub Actions".
2. **Mudanças fora do escopo.** A Fase 0 proibia mudar layout ou comportamento. Foram criadas 4 telas
   novas (`ClientsView`, `SalesSimulatorView`, `AnticipationView`, `NextPayServicesView`) e o menu passou
   de 6 para 19 itens (Serasa, Open Finance, Pague Contas, Cartão NextPay, Notas Fiscais, Vendas Físicas,
   "Flapp Store", Benefícios etc.). Essas telas simulam sucesso com `setTimeout` + toast
   ("Consulta Serasa concluída", "Boleto agendado para liquidação", "Módulo ativado"), o que viola a
   regra 8 (nenhum botão fingindo funcionar). "Flapp Store" é o nome da loja de parceiros do próprio Asaas e não deve aparecer na marca NextPay.
3. **`parseBRLToCents` aceita entradas inválidas sem erro:**
   - `"0,555"` → 55 e `"R$ 1.500,999"` → 150099 (corta casas decimais em silêncio)
   - `"1R2,00"` → 1200 e `"1-2"` → 1200 (remove letras R, `$` e `-` de qualquer posição)
   - `"--5"` → -500, `"12.34.5"` → 1234500 (pontos de milhar em posição errada)
4. **TypeScript e ESLint frouxos.** `tsconfig.json` não tem `"strict": true` (regra 2 do contexto
   mestre) e o ESLint desliga `no-explicit-any` e `no-unused-vars`.

### Menores

5. Dois lockfiles: `bun.lock` e `package-lock.json`. O projeto usa npm; remover `bun.lock`.
6. Nomes de variáveis de ambiente diferentes do combinado: `ASAAS_ENVIRONMENT` (deveria ser `ASAAS_ENV`)
   e `WEBHOOK_TOKEN` (deveria ser `ASAAS_WEBHOOK_TOKEN`). Falta `DATABASE_URL` / `DATABASE_URL_TEST`.
7. README com afirmações que o produto ainda não cumpre ("conformidade com as regras do Banco
   Central", "liquidação rápida").
8. Processo: o commit foi feito direto na `main`. Nas próximas fases, salve numa branch
   (`ai-studio/fase-N`) para que a auditoria aconteça antes de entrar na `main`.

## Prompt de correção (colar no AI Studio)

Cole primeiro a **Atualização do contexto** (seção abaixo) e depois este prompt.

```text
A auditoria da Fase 0 encontrou os problemas abaixo. Corrija TODOS, um a um, sem alterar nada que
não esteja na lista. Ao final, para cada item, diga o arquivo e o que mudou.

1. Crie .github/workflows/ci.yml: em push e pull_request, Node 22, `npm ci`, `npm run typecheck`,
   `npm run lint`, `npx prettier --check .`, `npm test` e `npm run build`.

2. A Fase 0 não permitia novas telas nem funções simuladas. Faça assim:
   - Apague AnticipationView, SalesSimulatorView e NextPayServicesView e todo código que simula
     sucesso com setTimeout + toast nessas funções.
   - No menu, mantenha os itens abaixo VISÍVEIS, porém DESABILITADOS, com o selo "Em breve" e sem
     abrir tela: Antecipações, Consulta Serasa & Negativação, Pague Contas, Recarga de Celular
     (Fase 7); Notas Fiscais (Fase 8); Simular Venda, Vendas Físicas (Tap), Cartão NextPay,
     Open Finance, Benefícios & Indique e a loja de aplicativos (fora do escopo atual).
   - "Flapp Store" é a loja de parceiros do próprio Asaas e não deve aparecer na marca do
     NextPay: remova o nome "Flapp" de todo o código; o item do menu se chama "Loja NextPay".
   - Mantenha ClientsView, mas o botão de novo cliente fica desabilitado com "Em breve" até a
     Fase 1 (que cria /api/customers).
   - Nenhum toast de sucesso pode ser disparado sem uma operação real.

3. parseBRLToCents deve LANÇAR erro (nunca corrigir em silêncio) quando:
   - houver mais de 2 casas decimais ("0,555", "1.500,999");
   - houver letras ou símbolos fora do prefixo "R$" ("1R2,00", "12a");
   - o sinal "-" aparecer em posição diferente do início ou logo após "R$" ("1-2", "--5");
   - pontos de milhar estiverem fora de grupos de 3 dígitos ("12.34.5", "1.50").
   Use uma expressão regular completa para o formato aceito em vez de remover caracteres.
   Adicione esses casos aos testes.

4. Ative "strict": true no tsconfig.json e corrija todos os erros resultantes. No ESLint, reative
   @typescript-eslint/no-explicit-any e @typescript-eslint/no-unused-vars como "error"
   (permitindo variáveis com prefixo "_"). Corrija todos os avisos sem usar eslint-disable.

5. Apague bun.lock. O projeto usa somente npm.

6. Em .env.example e no README, use exatamente estes nomes: PORT, APP_URL, DATABASE_URL,
   DATABASE_URL_TEST, ASAAS_API_KEY, ASAAS_ENV (sandbox|production), ASAAS_WEBHOOK_TOKEN,
   JWT_SECRET, ENCRYPTION_KEY, NEXTPAY_WALLET_ID.

7. No README, remova afirmações que o produto ainda não cumpre (conformidade com o Banco Central,
   liquidação rápida etc.) e descreva o estado real: protótipo em evolução por fases.
   Inclua no README a regra de preço dos serviços sob demanda: custo do Asaas + R$ 0,49 por uso.

8. Nome: em todo texto visível ao usuário (telas, títulos, README, index.html, metadata.json,
   comprovantes) o nome é exatamente "NextPay". Nomes de código seguem a convenção
   (nextpay, NEXTPAY_...).

Critério de pronto: `npm ci && npm run typecheck && npm run lint && npx prettier --check . &&
npm test && npm run build` sem erros; nenhum toast de sucesso falso; CI rodando no GitHub.
Salve na branch ai-studio/fase-0-correcoes (NÃO na main).
```

## Atualização do contexto (colar antes do prompt de correção)

```text
ATUALIZAÇÃO DO CONTEXTO: o texto abaixo substitui o contexto mestre anterior. Mudanças: stack
fixa (React + Vite + Express + Prisma + PostgreSQL), estrutura de pastas alvo, modelo de negócio
com subcontas Asaas por lojista e comissão do NextPay via split, e nome sempre "NextPay".
Não altere nenhum arquivo agora.

Você está evoluindo o app NextPay: um painel white-label de pagamentos (Pix, cartão,
boleto, links de pagamento, catálogo de produtos, assinaturas e saques) voltado a pequenos
prestadores de serviço brasileiros. Toda a interface está em português do Brasil.

ESTADO ATUAL (depois da Fase 0)
- Front-end em React 19 + Vite 8 + Tailwind CSS 4 + TypeScript; nome NextPay já aplicado; ESLint,
  Prettier, Vitest e src/lib/format.ts criados; `npm ci` funciona.
- Ainda TUDO é simulado: dados fictícios em src/data/mockData.ts, sem back-end, banco,
  autenticação, rotas por URL nem integração real com o Asaas.
- A auditoria da Fase 0 pediu correções, que virão na próxima mensagem.

OBJETIVO
Transformar o protótipo em um app funcional, com back-end próprio integrado à API do Asaas
(gateway de pagamentos brasileiro), mantendo o visual atual.

MODELO DE NEGÓCIO (white-label sobre o Asaas)
- O NextPay tem UMA conta raiz no Asaas (ASAAS_API_KEY). Cada lojista que se cadastra no NextPay
  ganha uma SUBCONTA Asaas própria, criada pela API de subcontas (BaaS). O dinheiro das vendas cai
  na subconta do lojista, nunca na conta raiz.
- Toda operação de um lojista (cobrança, saque, serviço) é feita com a chave de API da subconta
  DELE. A chave da conta raiz só cria subcontas e consulta dados da plataforma.
- O NextPay ganha dinheiro de duas formas: (a) comissão sobre cada venda, enviada para a carteira
  da conta raiz (NEXTPAY_WALLET_ID) pelo split de pagamento do Asaas; (b) preço próprio dos
  serviços sob demanda (Fase 7): o preço ao lojista é SEMPRE o custo cobrado pelo Asaas + R$ 0,49
  (49 centavos) por uso.
- Nome do produto: escreva sempre exatamente "NextPay" em todo texto visível ao usuário. Em nomes
  de código siga a convenção da linguagem (nextpay, NEXTPAY_...).

STACK DEFINIDA (não negociável — não proponha alternativas)
- Front-end: React 19 + Vite + Tailwind CSS 4 + TypeScript (SPA).
  Rotas: React Router v7 em modo biblioteca (BrowserRouter/createBrowserRouter), NÃO o "framework
  mode" nem o plugin de Vite do React Router. Dados no front: TanStack Query.
- Back-end: Node 22 + Express + TypeScript, executado com `tsx`. Validação com `zod`.
- Banco: PostgreSQL gerenciado (Neon ou Supabase, usado apenas como Postgres) acessado
  exclusivamente pelo Prisma ORM.
- Testes: Vitest + Testing Library (unitários), supertest (API), Playwright (E2E).
- PROIBIDO: Next.js, Remix, NestJS, Firebase/Firestore, SDK do Supabase, SQLite, Mongo, ORM que
  não seja Prisma, e trocar o Vite por outro bundler.

ESTRUTURA DE PASTAS ALVO
  server.ts                 → inicia o Express (API + Vite middleware em dev, dist/ em produção)
  server/routes/*           → rotas Express por recurso
  server/repositories/*     → únicas funções que usam o Prisma
  server/integrations/*     → clientes de APIs externas (Asaas)
  server/lib/*              → utilitários do servidor (auth, erros, validação)
  server/db.ts              → instância única do PrismaClient
  prisma/schema.prisma, prisma/migrations/*, prisma/seed.ts
  src/                      → front-end (views, components, api/client.ts, lib/format.ts)
  shared/                   → tipos e schemas zod usados pelo front e pelo back
  O tsconfig deve cobrir src/, server/, shared/ e prisma/, para que `npm run typecheck`
  verifique front e back.

REGRAS OBRIGATÓRIAS (valem para todas as fases)
1. Preserve o design: mesmas cores, tokens de tema de src/index.css, tipografia, espaçamentos e
   textos. Só altere a aparência quando a fase pedir.
2. Siga a STACK DEFINIDA e a ESTRUTURA DE PASTAS acima. TypeScript em modo `strict`, sem `any`
   implícito. O servidor escuta na porta 3000. Prisma na versão estável mais recente, seguindo a
   documentação oficial dessa versão; conexão por `process.env.DATABASE_URL`; nada de SQL solto.
3. Segredos (DATABASE_URL, chaves do Asaas, JWT_SECRET, ENCRYPTION_KEY, token de webhook) só existem
   no servidor, lidos de `process.env`. Nunca envie segredo ao navegador e nunca escreva tokens no
   código. As chaves de API das subcontas ficam no banco cifradas (AES-256-GCM com ENCRYPTION_KEY)
   e nunca aparecem em logs nem em respostas da API.
4. Toda chamada ao Asaas acontece no servidor. O front só conversa com a nossa API em `/api/*`.
5. Dinheiro é armazenado e trafega como inteiro em centavos (`amountCents: number`; no Prisma,
   campo `Int`, nunca `Float` nem `Decimal`). Formatação em R$ acontece só na exibição, por uma
   função única `formatBRL(cents)` em src/lib/format.ts. Não crie campos "...Formatted" nos dados.
6. Datas trafegam em ISO 8601 (UTC) e são formatadas na exibição com Intl / pt-BR.
7. Valide toda entrada no servidor com `zod`. Erros da API respondem
   `{ "error": { "code": string, "message": string } }` com o status HTTP correto.
8. Não deixe nenhum botão "fingindo" funcionar. Se uma função ainda não foi implementada nesta
   fase, o botão fica desabilitado com tooltip "Em breve" — nunca um toast de sucesso falso.
9. Não apague funcionalidades existentes sem pedir.
10. Ao terminar cada fase, responda com: (a) lista de arquivos criados/alterados, (b) novas
    variáveis de ambiente, (c) passo a passo para testar manualmente, (d) o que ficou pendente.

Responda apenas "Contexto atualizado" e aguarde a próxima mensagem.
```
