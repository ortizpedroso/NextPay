# NextPay — Análise do projeto e checklist de pendências

## Diagnóstico

O projeto é um **protótipo de front-end** (React 19 + Vite + Tailwind 4) exportado do Google AI Studio.
A interface está completa visualmente e navegável, mas **não é um produto funcional**: não há
back-end, banco de dados, autenticação nem integração real com gateway de pagamento. Tudo roda em
memória sobre os dados fictícios de `src/data/mockData.ts`, e as ações (pagar, sacar, emitir boleto,
conectar integrações) apenas exibem um toast ou um `setTimeout` simulando sucesso.

### O que foi verificado

| Verificação | Resultado |
|---|---|
| `npm install` | ❌ **Falha** (conflito de peer deps: `esbuild@^0.25` vs `vite@8` que pede `^0.27 \|\| ^0.28`). Só instala com `--legacy-peer-deps`. |
| `npm run lint` (`tsc --noEmit`) | ✅ Sem erros (após instalar) |
| `npm run build` | ✅ Gera `dist/` (aviso sobre `__dirname` no `vite.config.ts`) |
| Navegação em todas as telas (Chromium headless) | ✅ Renderizam sem erros de JavaScript |
| Testes automatizados | ❌ Não existem |

### O que já existe (somente UI/mock)

- Dashboard com saldo, gráfico estático, tabela de transações com busca/filtro
- Cobranças & Links: formulário de criação de link, lista com filtro, tabela de cobranças
- Produtos & Serviços: catálogo com busca/filtro, drawer de cadastro com preview
- Assinaturas: planos e assinantes (dados fixos dentro do componente)
- Integrações & API / Taxas: token, ambiente sandbox/prod, webhooks logs, dados bancários
- Checkout público: Pix (QR fake), cartão, boleto, cronômetro
- Modais: nova cobrança, QR Pix, saque, comprovante

---

## Checklist do que falta implementar

### 1. Build e configuração do projeto
- [ ] Corrigir conflito de dependências (atualizar `esbuild` para `^0.27`/`^0.28` ou removê-lo) para `npm install` funcionar sem `--legacy-peer-deps`
- [ ] Versionar `package-lock.json`
- [ ] Renomear o pacote (`"name": "react-example"`) para o nome do projeto
- [ ] Remover dependências não usadas ou passar a usá-las (`@google/genai`, `express`, `dotenv` estão no `package.json` mas não são importados em lugar nenhum)
- [ ] Substituir `__dirname` por `import.meta.dirname` em `vite.config.ts`
- [ ] Renomear o produto para **NextPay** em todo o código (hoje telas, `index.html` e `metadata.json` usam "NexusPay")
- [ ] Criar `README.md` com instruções de setup, execução e deploy
- [ ] Configurar ESLint/Prettier (o script `lint` hoje só roda `tsc`)
- [ ] Configurar CI (GitHub Actions: install, lint, build, testes)

### 2. Back-end / API (inexistente)
- [ ] Criar servidor (ex.: Express já listado nas dependências) com API REST
- [ ] Banco de dados PostgreSQL com Prisma (schema, migrações versionadas e seed) e modelagem: contas/subcontas, clientes, produtos, links, cobranças, transações, assinaturas, saques, webhooks
- [ ] Substituir `mockData.ts` e o estado em memória do `App.tsx` por chamadas à API (os dados se perdem ao recarregar a página)
- [ ] Camada de serviço/cliente HTTP no front (loading, erros, retries)
- [ ] Variáveis de ambiente reais (`.env.example` só tem `GEMINI_API_KEY` e `APP_URL`, nenhuma chave de gateway)

### 3. Autenticação e contas
- [ ] Login, cadastro, recuperação de senha
- [ ] 2FA real (hoje "Sessão protegida via 2FA" é só um toast)
- [ ] Troca de subconta/organização persistente (Header só exibe toast)
- [ ] Controle de acesso / permissões por usuário
- [ ] Logout e tela de configurações da conta

### 4. Integração com gateway de pagamento (ex.: Asaas, citado na UI)
- [ ] Criação real de cobranças Pix, cartão e boleto
- [ ] Pix: gerar BR Code / Copia-e-Cola dinâmico por cobrança (hoje é uma string fixa) e QR Code real (hoje é um SVG desenhado à mão)
- [ ] Cartão: tokenização, antifraude/3DS, parcelamento com cálculo real de juros (hoje um `setTimeout` aprova qualquer cartão)
- [ ] Boleto: emissão, linha digitável e PDF
- [ ] Recebimento de webhooks do gateway com validação de assinatura, atualizando status das cobranças
- [ ] Confirmação de pagamento em tempo real no checkout (polling/WebSocket) em vez do botão "Simular pagamento"
- [ ] Saque/transferência real com validação de saldo no servidor (hoje só subtrai do estado local)
- [ ] Antecipação de recebíveis (hoje só toast)
- [ ] Alternância Sandbox/Produção usando credenciais reais
- [ ] Teste de latência real da API (hoje é `Math.random()`)

### 4b. Modelo white-label e serviços sob demanda (Asaas)
- [ ] Uma subconta Asaas por lojista (BaaS), com chave de API cifrada no banco
- [ ] Comissão do NextPay em cada venda via split para a carteira da conta raiz
- [ ] Serviços sob demanda com preço = custo Asaas + R$ 0,49: consulta e negativação Serasa, pague contas, recarga de celular, antecipação
- [ ] Notas fiscais (NFS-e): decidir entre Asaas e API externa antes de implementar (fase final)
- [ ] Fora do escopo por enquanto (ficam "Em breve"): Cartão NextPay, Open Finance, Vendas Físicas (Tap), loja de apps, benefícios

### 5. Funcionalidades incompletas por tela
**Dashboard**
- [ ] Gráfico de receita gerado a partir dos dados (hoje SVG estático; o seletor de período não altera nada)
- [ ] Métricas/KPIs calculados a partir das transações
- [ ] Paginação real da tabela (botões desabilitados, "Página 1 de 30" fixo)

**Cobranças & Links**
- [ ] Links de pagamento com URL pública própria e rota acessível
- [ ] Pausar/ativar, editar e excluir links
- [ ] Exportação CSV real (hoje só toast)
- [ ] Reenvio de cobrança e lembretes por WhatsApp/e-mail via provedor (hoje só toast)
- [ ] Respeitar no checkout as opções escolhidas (métodos habilitados, parcelas máximas, quem paga a taxa, multa/juros)
- [ ] Paginação da tabela

**Produtos & Serviços**
- [ ] Upload real de imagem de capa (hoje sempre define uma URL de exemplo)
- [ ] Editar e excluir produtos
- [ ] Validação de formulário mais completa

**Assinaturas**
- [ ] Mover dados para a camada de dados/API (estão fixos dentro do componente)
- [ ] Criar/editar planos, gerenciar assinantes, cancelar/pausar assinaturas
- [ ] Cobrança recorrente automática e tratamento de inadimplência
- [ ] Botões "Copiar link" e "Gerenciar" funcionais (só exibem toast)

**Integrações & API / Configurações de Taxas**
- [ ] Separar as duas telas (os dois itens do menu abrem a mesma view)
- [ ] Geração/rotação real de tokens de API
- [ ] Cadastro e edição real de endpoints de webhook
- [ ] Integrações WooCommerce, Shopify, Nuvemshop e infoprodutos (botões só exibem toast)
- [ ] Salvar dados bancários de fato (hoje só fecha o formulário)
- [ ] Persistir configuração de repasse de juros/taxas

**Checkout**
- [ ] Roteamento por URL (ex.: `/pay/:id`) — hoje é só um estado interno do `App`, sem como compartilhar o link
- [ ] Validação de CPF/CNPJ, número de cartão (Luhn), validade e CVV
- [ ] Máscaras de entrada (CPF, telefone, cartão)
- [ ] Botão de WhatsApp apontando para o número real do vendedor (hoje abre `api.whatsapp.com` genérico)
- [ ] Envio real de comprovante por e-mail

**Modais**
- [ ] Comprovante: impressão/geração de PDF real (`window.print` ou lib de PDF)
- [ ] Nova cobrança: CPF/CNPJ do cliente (hoje grava `***.000.000-**`) e data de vencimento
- [ ] Datas reais nas transações (hoje "Agora"/"Hoje" como texto)

### 6. Arquitetura e qualidade de código
- [ ] Roteador (ex.: React Router) em vez de `currentView` em `useState` — hoje não há URLs, botão voltar nem deep links
- [ ] Gerenciamento de estado/cache de dados (ex.: TanStack Query, Zustand)
- [ ] Guardar valores monetários como número/centavos e formatar na exibição (hoje há campos `*Formatted` duplicados nos dados)
- [ ] Quebrar views grandes (500–1000 linhas) em componentes menores
- [ ] Tratamento de erros (error boundary, estados de erro e vazio)
- [ ] Hospedar imagens localmente (dependem de URLs temporárias `lh3.googleusercontent.com/aida-public`)
- [ ] Remover o ícone por fonte Material Symbols remota ou empacotá-lo

### 7. Testes
- [ ] Testes unitários (ex.: Vitest) para cálculos de taxa, filtros e formatação
- [ ] Testes de componentes (Testing Library)
- [ ] Testes E2E (Playwright) dos fluxos principais: criar cobrança, checkout, saque

### 8. Segurança, compliance e operação
- [ ] Nunca expor tokens de API no front-end (hoje há tokens fixos no componente)
- [ ] Conformidade PCI-DSS para dados de cartão (usar tokenização do gateway, nunca trafegar o PAN pelo próprio servidor)
- [ ] LGPD: política de privacidade, termos de uso, tratamento de dados pessoais
- [ ] Logs de auditoria, rate limiting, proteção CSRF/XSS
- [ ] Monitoramento e alertas (Sentry etc.)
- [ ] Deploy (ambientes de staging e produção)

### 9. UX e acessibilidade
- [ ] Revisar acessibilidade: `label`/`aria` em botões só com ícone, foco em modais, fechar com `Esc`
- [ ] Notificações do header reais (hoje fixas)
- [ ] Modo escuro / white-label configurável (cores e logo por cliente, já que o produto se diz white-label)
- [ ] Revisar responsividade em telas pequenas
