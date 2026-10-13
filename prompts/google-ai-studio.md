# Prompts para o Google AI Studio — NexusPay

Como usar:

1. Cole o **Contexto mestre** uma única vez, no início da conversa do AI Studio (modo Build).
2. Cole **uma fase por vez**, na ordem. Não avance para a próxima antes de a fase atual funcionar.
3. Ao fim de cada fase, salve no GitHub (botão "Save to GitHub") em uma branch própria, por exemplo
   `ai-studio/fase-1`, e me peça a auditoria informando o nome da branch.
4. Eu rodo instalação, typecheck, build e testes, leio o código contra os **critérios de aceite** da
   fase e devolvo uma lista de correções, que você cola de volta no AI Studio.

Configure no painel **Secrets** do AI Studio, antes da Fase 3:
`ASAAS_API_KEY` (chave do **sandbox**), `ASAAS_ENV=sandbox`, `ASAAS_WEBHOOK_TOKEN` (texto aleatório
que você inventa), `JWT_SECRET` (texto aleatório longo).

---

## Contexto mestre (colar primeiro)

```text
Você vai evoluir um app existente chamado NexusPay: um painel white-label de pagamentos (Pix, cartão,
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

REGRAS OBRIGATÓRIAS (valem para todas as fases)
1. Preserve o design: mesmas cores, tokens de tema de src/index.css, tipografia, espaçamentos e
   textos. Só altere a aparência quando a fase pedir.
2. Stack fixa: React 19, Vite, Tailwind 4, TypeScript estrito no front e no back. Back-end em
   Express, arquivo `server.ts` na raiz, executado com `tsx`, servindo o Vite como middleware em
   desenvolvimento e a pasta `dist/` em produção, na porta 3000. Não troque de framework.
3. Segredos (chave do Asaas, JWT_SECRET, token de webhook) só existem no servidor, lidos de
   `process.env`. Nunca envie segredo ao navegador e nunca escreva tokens no código.
4. Toda chamada ao Asaas acontece no servidor. O front só conversa com a nossa API em `/api/*`.
5. Dinheiro é armazenado e trafega como inteiro em centavos (`amountCents: number`). Formatação
   em R$ acontece só na exibição, por uma função única `formatBRL(cents)` em src/lib/format.ts.
   Não crie campos "...Formatted" nos dados.
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
FASE 0 — Saneamento. Não mude nenhuma tela nesta fase.

1. package.json: renomeie "name" para "nexuspay". Corrija o conflito de dependências (atualize
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
   test e build.
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
   - `GET /api/health` → `{ ok: true }`;
   - middleware JSON, tratamento central de erros no formato padrão, log de cada requisição.
2. Persistência: use Firestore (via integração Firebase do AI Studio) se estiver disponível.
   Se não estiver, use SQLite com `better-sqlite3` em ./data/nexuspay.db. Em qualquer caso,
   acesse o banco SOMENTE por uma camada server/repositories/* com interfaces TypeScript, para
   que o banco possa ser trocado depois sem tocar nas rotas.
3. Modele (com campos createdAt/updatedAt e accountId em tudo, para multi-conta futura):
   Account, Customer (nome, cpfCnpj, email, telefone), Product (title, description, category,
   priceCents, billingType 'avulsa'|'recorrente', cycle opcional, imageUrl, active),
   PaymentLink, Charge (customerId, description, amountCents, method 'PIX'|'BOLETO'|'CREDIT_CARD',
   status, dueDate, asaasId opcional, feeCents, netCents), Subscription, Withdrawal, WebhookEvent.
4. Rotas REST com validação zod: CRUD de /api/products, /api/customers, /api/payment-links;
   leitura e criação de /api/charges (criação ainda só grava no banco, status 'PENDING').
   Listagens aceitam `?page=&pageSize=&q=` e retornam `{ items, total, page, pageSize }`.
5. Crie um script `npm run seed` que popula o banco convertendo o conteúdo de
   src/data/mockData.ts para o novo modelo (valores em centavos, datas ISO). Depois disso, as telas
   NÃO podem mais importar mockData.ts — apague o arquivo ao final da fase.
6. No front, crie src/api/client.ts (fetch tipado, tratamento de erro) e use TanStack Query para
   carregar e mutar dados. Mostre estados de carregando, vazio e erro em cada lista.
7. Ligue as telas Produtos, Cobranças & Links e Dashboard à API: criar, editar, excluir,
   pausar/ativar link, busca e paginação reais (remova o "Página 1 de 30" fixo). KPIs e gráfico do
   Dashboard calculados a partir das cobranças reais do período selecionado (7/14/30 dias).
8. Testes de integração das rotas com supertest (banco isolado por teste).

Critério de pronto: recarregar a página mantém os dados; nenhuma tela importa mockData;
os testes das rotas passam.
```

---

## Fase 2 — Rotas, autenticação e contas

```text
FASE 2 — Rotas e autenticação.

1. Adote React Router. Rotas: /login, /cadastro, /recuperar-senha, /app (dashboard),
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
   `access_token` com ASAAS_API_KEY, timeout, tratamento de erros do Asaas e tipos TypeScript
   das respostas usadas. Nenhum outro arquivo chama o Asaas diretamente.
2. Clientes: ao criar uma cobrança, garanta o cliente no Asaas (POST /customers) e guarde o
   asaasCustomerId. Valide CPF/CNPJ (dígitos verificadores) no front e no servidor.
3. Cobranças (POST /payments):
   - PIX: após criar, busque o QR Code (GET /payments/{id}/pixQrCode) e exiba a imagem base64 e o
     "copia e cola" reais no QrPixModal e no checkout. Apague o SVG desenhado e o código Pix fixo.
   - BOLETO: exiba linha digitável (GET /payments/{id}/identificationField) e link do PDF
     (bankSlipUrl) no checkout e na tabela de cobranças.
   - Grave asaasId, status, invoiceUrl, valor líquido e taxa retornados pelo Asaas.
4. Modal "Nova cobrança": campos cliente (busca ou cadastro com CPF/CNPJ), descrição, valor,
   vencimento e método; chama a API; a tabela atualiza sozinha.
5. Webhook: POST /api/webhooks/asaas. Rejeite (401) se o cabeçalho `asaas-access-token` não for
   igual a ASAAS_WEBHOOK_TOKEN. Grave cada evento em WebhookEvent; seja idempotente (o mesmo
   evento recebido duas vezes não pode alterar nada na segunda); trate PAYMENT_CREATED,
   PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED e PAYMENT_DELETED
   atualizando o status da cobrança. Responda 200 rápido.
6. A tela Integrações passa a listar os WebhookEvent reais (com payload) e o download JSON usa
   esses dados. Remova os logs fictícios. O "teste de latência" mede de verdade uma chamada leve
   ao Asaas feita pelo servidor.
7. Saldo do Dashboard vem do Asaas (GET /finance/balance), não de estado local.
8. Testes: cliente Asaas com respostas simuladas (sem rede), webhook (token inválido → 401,
   evento duplicado → sem efeito, mudança de status correta).

Critério de pronto: no sandbox, criar uma cobrança Pix mostra QR Code real; pagar/confirmar a
cobrança pelo painel do Asaas sandbox muda o status no NexusPay via webhook.
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
4. CARTÃO DE CRÉDITO: para não colocar o NexusPay no escopo PCI, NÃO colete número de cartão em
   formulário próprio. Crie a cobrança com billingType CREDIT_CARD e redirecione o comprador para
   a invoiceUrl do Asaas (ou use o checkout hospedado do Asaas). Remova o formulário de cartão
   atual e o texto "aprovado via antifraude 3DS".
5. Confirmação em tempo real: a página consulta GET /api/public/charges/:id/status a cada 5 s
   (pare após pagamento ou expiração) e mostra a tela de sucesso só quando o webhook tiver
   confirmado. O cronômetro reflete a expiração real do Pix. O botão "Simular pagamento" só
   aparece quando ASAAS_ENV=sandbox.
6. Botão do WhatsApp abre wa.me com o número real do vendedor e mensagem pré-preenchida.
7. Cobranças & Links: o link gerado é a URL real `${APP_URL}/pagar/:slug`; copiar e compartilhar
   no WhatsApp usam essa URL. Produtos ganham o mesmo link.
8. Exportação CSV real das cobranças filtradas (separador ;, UTF-8 com BOM, valores em reais).
9. Comprovante: gere PDF ou use window.print com folha de estilo de impressão, com dados reais da
   cobrança paga.
10. Upload real da imagem de capa do produto (aceite jpg/png/webp até 2 MB, valide tipo no
    servidor, guarde no armazenamento disponível e salve a URL).

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
   chaves de API próprias do NexusPay (guarde só o hash). Remova os tokens escritos no código.
   Cadastro de URLs de webhook de saída do lojista. Os cards WooCommerce/Shopify/Nuvemshop/
   Infoprodutos ficam desabilitados com "Em breve".
6. Antecipação de recebíveis: botão desabilitado com "Em breve" (remova o toast falso).
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

## Prompt de correção (usar após cada auditoria)

```text
A auditoria da fase N encontrou os problemas abaixo. Corrija TODOS, um a um, sem alterar nada que
não esteja na lista. Ao final, para cada item, diga o arquivo e o que mudou.

[colar aqui a lista que o Claude devolver]
```
