# Prompts para o Google AI Studio — NextPay

Como usar:

1. Cole o **Contexto mestre** uma única vez, no início da conversa do AI Studio (modo Build).
2. Cole **uma fase por vez**, na ordem. Não avance para a próxima antes de a fase atual funcionar.
3. Ao fim de cada fase, salve no GitHub (botão "Save to GitHub") em uma branch própria, por exemplo
   `ai-studio/fase-1` — **nunca direto na `main`** — e me peça a auditoria informando o nome da branch.
4. Eu rodo instalação, typecheck, build e testes, leio o código contra os **critérios de aceite** da
   fase e devolvo uma lista de correções, que você cola de volta no AI Studio.

Antes da Fase 1, crie um banco **PostgreSQL gerenciado** (Neon ou Supabase têm plano gratuito) e
cadastre a string de conexão no painel **Secrets** do AI Studio como `DATABASE_URL`. Um banco em
arquivo (SQLite) não serve: o AI Studio publica no Cloud Run, que apaga os arquivos a cada
reinício. Crie também um segundo banco só para testes e cadastre como `DATABASE_URL_TEST`.

Configure no painel **Secrets** do AI Studio, antes da Fase 3:
`ASAAS_API_KEY` (chave da conta raiz do NextPay no **sandbox**), `ASAAS_ENV=sandbox`,
`ASAAS_WEBHOOK_TOKEN` (texto aleatório que você inventa), `JWT_SECRET` (texto aleatório longo),
`ENCRYPTION_KEY` (32 bytes aleatórios em base64, para cifrar as chaves das subcontas) e
`NEXTPAY_WALLET_ID` (o walletId da conta raiz, que recebe a comissão do NextPay).

Ordem completa: Contexto mestre → Fase 0 → correção da Fase 0 (`audits/fase-0.md`) → Fase 1 →
Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8 (notas fiscais, só depois de decidir
entre Asaas e API externa). Depois de cada fase vem a auditoria e, se
necessário, o prompt de correção.

---

## Contexto mestre (colar primeiro)

```text
Você vai evoluir um app existente chamado NextPay (o código atual o chama, por engano, de
"NexusPay"; o nome correto é NextPay): um painel white-label de pagamentos (Pix, cartão,
boleto, links de pagamento, catálogo de produtos, assinaturas e saques) voltado a pequenos
prestadores de serviço brasileiros. Toda a interface está em português do Brasil.

ESTADO ATUAL
- Front-end pronto em React 19 + Vite 8 + Tailwind CSS 4 + TypeScript, com ícones Material Symbols.
- Arquivos: src/App.tsx (estado global em useState e navegação por `currentView`),
  src/views/* (DashboardView, PaymentLinksView, ProductsView, SubscriptionsView,
  RatesAndIntegrationsView, CheckoutView), src/components/* (Header, Sidebar, ProductDrawer),
  src/components/modals/* (NewCharge, QrPix, Withdraw, Receipt) e src/data/mockData.ts.
- TUDO é simulado: dados fictícios em memória, ações que só mostram toast ou usam setTimeout,
  QR Code Pix desenhado à mão, código Pix fixo, tokens de API escritos no código do componente.
- Não existe back-end, banco, autenticação, rotas por URL nem testes.
- `npm install` falha: devDependency `esbuild@^0.25` conflita com `vite@8`.

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

Responda apenas "Contexto entendido" e aguarde a Fase 0.
```

---

## Fase 0 — Saneamento do projeto

```text
FASE 0 — Saneamento. Não mude o layout nem o comportamento das telas nesta fase (só o nome).

1. Nome do produto: o nome correto é NextPay. Substitua TODAS as ocorrências de "NexusPay",
   "Nexus" e "nexuspay" no projeto (index.html, metadata.json, textos das telas, logo/alt do
   Sidebar, nomes de arquivo baixados, URLs de exemplo "nexuspay.link") por NextPay / nextpay.
   Ao final, buscar "nexus" (sem diferenciar maiúsculas) em src/, index.html e metadata.json
   não pode retornar nada.
   package.json: renomeie "name" para "nextpay". Corrija o conflito de dependências (atualize
   esbuild para uma versão aceita pelo vite 8 ou remova esbuild se não for usado diretamente) para
   que `npm install` funcione SEM --legacy-peer-deps. Remova @google/genai se nenhuma fase o usar.
   Mantenha express e dotenv (serão usados na Fase 1).
2. vite.config.ts: troque `__dirname` por `import.meta.dirname`.
3. Adicione ESLint (flat config, typescript-eslint, eslint-plugin-react-hooks) e Prettier.
   Scripts: "typecheck": "tsc --noEmit", "lint": "eslint .", "format": "prettier --write .".
4. Adicione Vitest + @testing-library/react + jsdom. Script "test": "vitest run".
   Crie src/lib/format.ts com formatBRL(cents) e parseBRLToCents("1.500,00") e testes para ambos
   (inclua 0, centavos, milhares, valores negativos e entradas inválidas).
5. Crie .github/workflows/ci.yml: em push e pull_request, Node 22, `npm ci`, typecheck, lint,
   test e build. (Na Fase 1 o CI ganhará um serviço PostgreSQL para os testes.)
6. Crie README.md em português: o que é o projeto, requisitos, como rodar, variáveis de ambiente,
   scripts disponíveis.
7. Gere e mantenha o package-lock.json.

Critério de pronto: `npm ci && npm run typecheck && npm run lint && npm test && npm run build`
passam sem erros e sem warnings de ESLint.
```

---

## Fase 1 — Back-end, banco e camada de dados

```text
FASE 1 — Back-end e persistência. Ainda sem Asaas e sem login.

1. Crie server.ts (Express) conforme o contexto mestre, com:
   - `GET /api/health` → `{ ok: true, db: true|false }` (testa a conexão com o banco);
   - middleware JSON, tratamento central de erros no formato padrão, log de cada requisição;
   - em desenvolvimento, Vite em modo middleware; em produção, arquivos de dist/ com fallback
     para index.html nas rotas que não começam com /api.
   Scripts: "dev": "tsx watch server.ts", "build": "vite build",
   "start": "prisma migrate deploy && NODE_ENV=production tsx server.ts".
2. Persistência com Prisma + PostgreSQL:
   - instale `prisma` (dev) e `@prisma/client`; schema em prisma/schema.prisma, provider
     "postgresql", url de `DATABASE_URL`;
   - se `DATABASE_URL` não estiver definida, o servidor deve falhar ao iniciar com uma mensagem
     clara (não use banco em memória como substituto);
   - crie UM cliente Prisma compartilhado em server/db.ts (singleton, sem abrir uma conexão por
     requisição) e acesse o banco só por funções em server/repositories/*; rotas não importam o
     Prisma direto;
   - versionar as migrações em prisma/migrations (gere com `prisma migrate dev`); nunca use
     `prisma db push` como fluxo oficial;
   - scripts: "db:migrate": "prisma migrate dev", "db:deploy": "prisma migrate deploy",
     "db:seed": "tsx prisma/seed.ts", "db:studio": "prisma studio"; rode `prisma generate` no
     "postinstall" e `prisma migrate deploy` antes de iniciar o servidor em produção.
3. Modele no schema.prisma (com id `cuid()`, createdAt/updatedAt e accountId em tudo, relações
   e índices em accountId e nos campos de busca; status e métodos como `enum` do Prisma):
   Account, Customer (nome, cpfCnpj, email, telefone), Product (title, description, category,
   priceCents, billingType 'avulsa'|'recorrente', cycle opcional, imageUrl, active),
   PaymentLink, Charge (customerId, description, amountCents, method 'PIX'|'BOLETO'|'CREDIT_CARD',
   status, dueDate, asaasId opcional, feeCents, netCents), Subscription, Withdrawal, WebhookEvent.
4. Rotas REST com validação zod: CRUD de /api/products, /api/customers, /api/payment-links;
   leitura e criação de /api/charges (criação ainda só grava no banco, status 'PENDING').
   Listagens aceitam `?page=&pageSize=&q=` e retornam `{ items, total, page, pageSize }`.
5. Crie prisma/seed.ts (`npm run db:seed`) com os mesmos exemplos de src/data/mockData.ts já
   convertidos para o novo modelo (valores em centavos, datas reais) e escritos dentro do próprio
   seed. O seed deve poder rodar duas vezes sem duplicar dados (use upsert). Depois disso, apague
   src/data/mockData.ts — nenhuma tela pode mais importá-lo.
6. No front, crie src/api/client.ts (fetch tipado, tratamento de erro) e use TanStack Query para
   carregar e mutar dados. Mostre estados de carregando, vazio e erro em cada lista.
7. Ligue as telas Produtos, Cobranças & Links e Dashboard à API: criar, editar, excluir,
   pausar/ativar link, busca e paginação reais (remova o "Página 1 de 30" fixo). KPIs e gráfico do
   Dashboard calculados a partir das cobranças reais do período selecionado (7/14/30 dias).
8. Testes de integração das rotas com supertest usando o banco de `DATABASE_URL_TEST` (aplique as
   migrações antes e limpe as tabelas entre testes). No ci.yml, adicione um serviço `postgres`
   e rode `prisma migrate deploy` antes dos testes.

Critério de pronto: recarregar a página mantém os dados; nenhuma tela importa mockData;
`prisma migrate deploy` num banco vazio cria todas as tabelas; os testes das rotas passam.
```

---

## Fase 2 — Rotas, autenticação e contas

```text
FASE 2 — Rotas e autenticação.

1. Adote React Router v7 em modo biblioteca (ver STACK DEFINIDA). Rotas: /login, /cadastro, /recuperar-senha, /app (dashboard),
   /app/cobrancas, /app/produtos, /app/assinaturas, /app/integracoes, /app/taxas e a rota pública
   /pagar/:slug (checkout). Remova o `currentView` do App.tsx. O botão voltar do navegador e links
   diretos devem funcionar. Separe "Integrações & API" e "Configurações de Taxas" em duas telas.
2. Autenticação no servidor: cadastro e login com e-mail e senha (hash com bcryptjs), sessão por
   JWT em cookie httpOnly, Secure e SameSite=Lax; logout; rota /api/me. Rate limit nas rotas de
   login/cadastro (express-rate-limit). Proteção de todas as rotas /api exceto health, auth,
   checkout público e webhook.
3. Cada usuário pertence a uma Account; toda consulta filtra pelo accountId da sessão. Um usuário
   nunca pode ler ou alterar dados de outra conta (escreva testes provando isso).
4. Header: nome e e-mail reais do usuário logado, menu com "Configurações da conta" (editar nome,
   trocar senha) e "Sair". Remova o seletor de subconta falso, ou implemente a troca de conta de
   verdade se o usuário pertencer a mais de uma.
5. Recuperação de senha: gere token de uso único com expiração de 30 minutos; enquanto não houver
   provedor de e-mail, registre o link no log do servidor e informe isso no README.
6. Remova o texto/toast "Sessão protegida via 2FA" (2FA fica para depois e deve aparecer como
   "Em breve").

Critério de pronto: sem login, /app redireciona para /login; com login, tudo funciona; testes de
isolamento entre contas passam.
```

---

## Fase 3 — Integração Asaas: cobranças Pix e boleto

```text
FASE 3 — Integração com o Asaas (sandbox). Confira cada endpoint na documentação oficial
(docs.asaas.com) antes de implementar; não invente campos.

1. Crie server/integrations/asaas.ts: cliente HTTP com base URL escolhida por ASAAS_ENV
   (sandbox: https://api-sandbox.asaas.com/v3, produção: https://api.asaas.com/v3), cabeçalho
   `access_token`, timeout, tratamento de erros do Asaas e tipos TypeScript das respostas usadas.
   O cliente recebe a chave como parâmetro: `asaasFor(account)` usa a chave (decifrada) da subconta
   do lojista; `asaasRoot()` usa ASAAS_API_KEY. Nenhum outro arquivo chama o Asaas diretamente.
1b. Subcontas: crie a tela "Ativar recebimentos" em /app/ativar, onde o lojista informa os dados
   exigidos pelo Asaas para abrir a subconta (nome/razão social, CPF/CNPJ, e-mail, telefone,
   endereço, faturamento etc. — confira a lista na documentação). O servidor cria a subconta com
   `asaasRoot()` (POST /accounts), guarda no Account o id, o walletId e a chave da subconta
   (cifrada) e configura o webhook da subconta apontando para /api/webhooks/asaas. Mostre o status
   de aprovação da subconta. Enquanto ela não estiver aprovada, criar cobranças fica desabilitado
   com a explicação do motivo.
1c. Comissão do NextPay: tabela PlatformFee no banco (percentual e/ou valor fixo por método de
   pagamento, editável só por administrador). Toda cobrança criada envia `split` para
   NEXTPAY_WALLET_ID com a comissão vigente, e o valor fica gravado na Charge (platformFeeCents).
2. Clientes: ao criar uma cobrança, garanta o cliente no Asaas (POST /customers) e guarde o
   asaasCustomerId. Valide CPF/CNPJ (dígitos verificadores) no front e no servidor.
3. Cobranças (POST /payments):
   - PIX: após criar, busque o QR Code (GET /payments/{id}/pixQrCode) e exiba a imagem base64 e o
     "copia e cola" reais no QrPixModal e no checkout. Apague o SVG desenhado e o código Pix fixo.
   - BOLETO: exiba linha digitável (GET /payments/{id}/identificationField) e link do PDF
     (bankSlipUrl) no checkout e na tabela de cobranças.
   - Grave asaasId, status, invoiceUrl, valor líquido e taxa retornados pelo Asaas.
   - Todas essas chamadas usam `asaasFor(conta do lojista)`.
4. Modal "Nova cobrança": campos cliente (busca ou cadastro com CPF/CNPJ), descrição, valor,
   vencimento e método; chama a API; a tabela atualiza sozinha.
5. Webhook: POST /api/webhooks/asaas (recebe eventos de todas as subcontas; identifique a conta
   pelo id da subconta presente no evento ou pelo cliente/cobrança). Rejeite (401) se o cabeçalho `asaas-access-token` não for
   igual a ASAAS_WEBHOOK_TOKEN. Grave cada evento em WebhookEvent; seja idempotente (o mesmo
   evento recebido duas vezes não pode alterar nada na segunda); trate PAYMENT_CREATED,
   PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED e PAYMENT_DELETED
   atualizando o status da cobrança. Responda 200 rápido.
6. A tela Integrações passa a listar os WebhookEvent reais (com payload) e o download JSON usa
   esses dados. Remova os logs fictícios. O "teste de latência" mede de verdade uma chamada leve
   ao Asaas feita pelo servidor.
7. Saldo do Dashboard vem do Asaas (GET /finance/balance, com a chave da subconta), não de estado
   local.
8. Testes: cliente Asaas com respostas simuladas (sem rede), webhook (token inválido → 401,
   evento duplicado → sem efeito, mudança de status correta), split enviado com a comissão certa,
   chave de subconta nunca retornada pela API.

Critério de pronto: no sandbox, criar uma cobrança Pix mostra QR Code real; pagar/confirmar a
cobrança pelo painel do Asaas sandbox muda o status no NextPay via webhook.
```

---

## Fase 4 — Checkout público, cartão e links de pagamento

```text
FASE 4 — Checkout público.

1. A rota /pagar/:slug carrega (sem login) o produto ou link de pagamento pelo slug através de
   GET /api/public/checkout/:slug, que retorna só dados públicos (título, descrição, valor,
   métodos habilitados, parcelas máximas, nome e WhatsApp do vendedor). Slug inexistente ou link
   pausado → página "Link indisponível".
2. O checkout respeita as opções do link: métodos habilitados, parcelas máximas, quem paga a taxa,
   multa/juros e vencimento.
3. O comprador informa nome, CPF/CNPJ, e-mail e WhatsApp (com máscaras e validação). Ao escolher
   o método, o servidor cria a cobrança no Asaas.
4. CARTÃO DE CRÉDITO: para não colocar o NextPay no escopo PCI, NÃO colete número de cartão em
   formulário próprio. Crie a cobrança com billingType CREDIT_CARD e redirecione o comprador para
   a invoiceUrl do Asaas (ou use o checkout hospedado do Asaas). Remova o formulário de cartão
   atual e o texto "aprovado via antifraude 3DS".
5. Confirmação em tempo real: a página consulta GET /api/public/charges/:id/status a cada 5 s
   (pare após pagamento ou expiração) e mostra a tela de sucesso só quando o webhook tiver
   confirmado. O cronômetro reflete a expiração real do Pix. O botão "Simular pagamento" só
   aparece quando ASAAS_ENV=sandbox e usa a API "Ações em sandbox" do Asaas para confirmar o
   pagamento de verdade no sandbox (o status muda pelo webhook, não pelo front).
6. Botão do WhatsApp abre wa.me com o número real do vendedor e mensagem pré-preenchida.
7. Cobranças & Links: o link gerado é a URL real `${APP_URL}/pagar/:slug`; copiar e compartilhar
   no WhatsApp usam essa URL. Produtos ganham o mesmo link.
8. Exportação CSV real das cobranças filtradas (separador ;, UTF-8 com BOM, valores em reais).
9. Comprovante: gere PDF ou use window.print com folha de estilo de impressão, com dados reais da
   cobrança paga.
10. Upload real da imagem de capa do produto (aceite jpg/png/webp até 2 MB, valide o tipo pelo
    conteúdo do arquivo no servidor). NÃO grave em disco: o Cloud Run apaga arquivos locais.
    Guarde a imagem no PostgreSQL (modelo Upload com campo `Bytes`, tipo e tamanho) e sirva por
    GET /api/uploads/:id com cache; o produto guarda o id/URL.

Critério de pronto: abrir /pagar/:slug numa janela anônima, pagar via Pix no sandbox e ver a tela
de sucesso; cartão redireciona para o Asaas.
```

---

## Fase 5 — Assinaturas, saques e configurações

```text
FASE 5 — Recorrência, saques e configurações.

1. Assinaturas: CRUD de planos (produtos recorrentes) e criação de assinaturas no Asaas
   (POST /subscriptions) com ciclo, valor, método e próximo vencimento. Tela lista assinantes
   reais com status, permite pausar/cancelar e reenviar a cobrança pendente. Trate os eventos de
   webhook de assinatura e marque inadimplentes. Remova os dados fixos de SubscriptionsView.
2. Saques: WithdrawModal chama POST /api/withdrawals, que valida o saldo no servidor (consultando
   o Asaas), cria a transferência (POST /transfers) e grava o Withdrawal. Exija confirmação da
   senha do usuário antes do saque. Histórico de saques na tela.
3. Dados bancários: formulário salva de verdade no servidor (validação de banco, agência e
   conta) e exige confirmação de senha.
4. Configurações de Taxas: persistir repasse de juros de parcelamento ao comprador e quem paga a
   taxa por padrão; mostrar a tabela de taxas vinda da configuração, não fixa no código.
5. Integrações & API: gerar, listar (mostrando só os 4 últimos caracteres), revogar e rotacionar
   chaves de API próprias do NextPay (guarde só o hash). Remova os tokens escritos no código.
   Cadastro de URLs de webhook de saída do lojista. Os cards WooCommerce/Shopify/Nuvemshop/
   Infoprodutos ficam desabilitados com "Em breve".
6. Antecipação de recebíveis: continua "Em breve" (será implementada na Fase 7).
7. Notificações do Header: listar eventos reais recentes (pagamentos recebidos, vencidos) com
   marcação de lidas persistida.

Critério de pronto: nenhum toast de sucesso falso restante no código (procure por onShowToast e
confirme que cada um é disparado após uma operação real ou é uma mensagem de validação).
```

---

## Fase 6 — Qualidade, segurança e acessibilidade

```text
FASE 6 — Acabamento.

1. Segurança: helmet, CORS restrito a APP_URL, rate limit global na API, limite de tamanho de
   corpo, cabeçalhos de cache corretos, nenhum dado sensível em logs (mascarar CPF, e-mail, tokens).
   Log de auditoria para login, saque, alteração bancária e chaves de API.
2. Error boundary no React e página 404.
3. Acessibilidade: aria-label em todo botão só com ícone, foco preso e retorno de foco nos modais,
   fechar modais com Esc, contraste AA, navegação completa por teclado.
4. Responsividade revisada em 375 px de largura sem rolagem horizontal.
5. Imagens: remova URLs lh3.googleusercontent.com/aida-public (são temporárias); use imagens
   locais em /public ou enviadas pelo usuário.
6. Testes E2E com Playwright: cadastro+login, criar produto, criar link, pagar no checkout (com o
   cliente Asaas simulado), ver status mudar, sacar.
7. Páginas de Termos de Uso e Política de Privacidade (LGPD) com texto-modelo marcado como
   "revisar com advogado", linkadas no rodapé do checkout e no cadastro.
8. Atualize o README com arquitetura, variáveis de ambiente, como configurar o webhook no Asaas e
   como ir de sandbox para produção.

Critério de pronto: CI verde com typecheck, lint, testes unitários, de integração e E2E.
```

---

## Fase 7 — Serviços sob demanda (Serasa, pague contas, recarga, antecipação)

```text
FASE 7 — Serviços sob demanda revendidos pelo NextPay. Use a referência oficial do Asaas
(https://docs.asaas.com/reference) para cada endpoint, campo, regra e tarifa; não invente nada.
Seções da documentação usadas nesta fase: "Consulta Serasa" (Credit Bureau Report),
"Negativações" (Payment Dunning), "Pagamento de contas" (Bill Payment), "Recargas de celular",
"Antecipações" (Anticipations), "Transferências" e "Webhooks".
Todas as chamadas usam `asaasFor(conta do lojista)`.

1. Regra de preço (fixa): preço ao lojista = custo cobrado pelo Asaas pelo serviço + 49 centavos.
   - Constante NEXTPAY_SERVICE_MARKUP_CENTS = 49 em shared/pricing.ts, com função
     `servicePrice(asaasCostCents) => asaasCostCents + 49` e testes.
   - Modelo ServiceCost (serviço, custo Asaas em centavos, atualizado em) editável só por
     administrador; o preço exibido é sempre calculado pela função acima, nunca digitado.
   - Modelo ServiceUsage (conta, serviço, referência no Asaas, custo Asaas, markup, preço total,
     status, data).
2. Fluxo de cobrança de todo serviço:
   a. mostre ao lojista "Custo do serviço: R$ X" (já com os R$ 0,49 somados) e peça confirmação;
   b. confira o saldo da subconta (custo Asaas + 0,49); sem saldo, recuse com mensagem clara;
   c. execute o serviço no Asaas (o Asaas debita o custo dele da subconta);
   d. se der certo, transfira os 49 centavos da subconta para NEXTPAY_WALLET_ID (transferência
      interna entre contas Asaas) e grave o ServiceUsage; se o serviço falhar, não cobre nada;
   e. se a transferência dos 49 centavos falhar, grave o ServiceUsage como "markup pendente" e
      tente de novo depois (job de reprocessamento), sem cobrar duas vezes.
   - Tela "Serviços" com histórico de uso, custo de cada item e total gasto no mês.
3. Consulta Serasa: o lojista informa CPF/CNPJ e vê o relatório retornado pelo Asaas. Guarde o
   resultado (reabrir não cobra de novo) e registre o aceite de uso dos dados conforme a LGPD.
4. Negativação Serasa: botão "Negativar" nas cobranças vencidas que cumprem as regras do Asaas
   (ex.: conta PJ aprovada, vencida há pelo menos o prazo mínimo). Status via webhook, opção de
   cancelar, e baixa quando a cobrança for paga.
5. Pague Contas: o lojista informa a linha digitável, o servidor consulta os dados do boleto no
   Asaas, mostra beneficiário, valor e vencimento para confirmação e paga (na hora ou agendado)
   com o saldo da subconta. Exija confirmação de senha. Status via webhook.
6. Recarga de celular: operadora, número e valor; confirmação de senha; status via webhook.
7. Antecipação de recebíveis: simule a antecipação de cobranças elegíveis (valor líquido e taxa
   vindos do Asaas), confirme com senha e acompanhe o status via webhook. A taxa de antecipação
   do Asaas também recebe os R$ 0,49 por operação.
8. Menu: Serasa, Pague Contas, Recarga de Celular e Antecipações passam de "Em breve" para
   ativos. Notas Fiscais continua "Em breve" (Fase 8). Cartão NextPay, Open Finance, Vendas
   Físicas (Tap), loja de apps e Benefícios continuam "Em breve".
9. Testes: função de preço (custo + 49), recusa sem saldo, nenhuma cobrança quando o serviço
   falha, reprocessamento do markup sem cobrança dupla, idempotência dos webhooks.

Critério de pronto: no sandbox, executar uma consulta Serasa, pagar um boleto, fazer uma recarga e
simular uma antecipação, vendo em cada ServiceUsage o custo Asaas + R$ 0,49 e a transferência dos
49 centavos para a carteira do NextPay.
```

---

## Fase 8 — Notas fiscais (NFS-e) — somente após a decisão Asaas × API externa

Ainda não decidido se as notas serão emitidas pelo Asaas (R$ 0,49 de tabela por nota + R$ 0,49 do
NextPay) ou por uma API externa de NFS-e. Antes de usar esta fase, revise o texto com o Claude para
a opção escolhida. Versão para emissão pelo Asaas:

```text
FASE 8 — Notas fiscais de serviço (NFS-e) pelo Asaas. Siga o guia oficial "Notas fiscais"
(https://docs.asaas.com), seções "Configurar informações fiscais" e "Emitindo notas fiscais de
serviço", inclusive "Adequando sua integração à Reforma Tributária". Use `asaasFor(conta)`.

1. Configuração fiscal da subconta (tela /app/notas/configuracao):
   a. GET /v3/fiscalInfo/municipalOptions para descobrir o que a prefeitura exige;
   b. monte o formulário dinamicamente a partir da resposta: authenticationType define as
      credenciais pedidas (USER_AND_PASSWORD → username e password; TOKEN → accessToken;
      CERTIFICATE → certificateFile e certificatePassword); usesSpecialTaxRegimes → campo
      specialTaxRegime com opções de specialTaxRegimesList; usesServiceListItem → serviceListItem;
   c. mostre os textos dos campos "...Help" como ajuda abaixo de cada campo (podem vir null) e
      NUNCA os envie de volta;
   d. POST /v3/fiscalInfo com email, municipalInscription, simplesNacional, cnae, rpsSerie,
      rpsNumber, as credenciais do método retornado e, opcionalmente,
      serviceProvisionCityDefaultType (MY_ACCOUNT_CITY | CUSTOMER_CITY |
      CUSTOMER_CITY_WHEN_ISS_IS_RETAINED);
   e. GET /v3/fiscalInfo para conferir (404 = não configurado). Emissão fica bloqueada até a
      configuração existir.
   Senhas, tokens e certificados da prefeitura só trafegam para o Asaas; não os guarde no banco
   do NextPay.
2. Emissão a partir de uma cobrança paga (manual ou automática), com o serviço municipal
   escolhido na lista retornada pelo Asaas; cancelamento só se supportsCancellation for true;
   download do PDF/XML; status via webhook.
3. Cobrança: cada nota segue a regra da Fase 7 (custo Asaas + R$ 0,49, com ServiceUsage).
4. Menu: Notas Fiscais passa a ativo.

Critério de pronto: no sandbox, configurar as informações fiscais, emitir e consultar uma nota.
```

---

## Prompt de correção (usar após cada auditoria)

```text
A auditoria da fase N encontrou os problemas abaixo. Corrija TODOS, um a um, sem alterar nada que
não esteja na lista. Ao final, para cada item, diga o arquivo e o que mudou.

[colar aqui a lista que o Claude devolver]
```
