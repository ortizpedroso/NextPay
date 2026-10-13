# NextPay

Painel white-label de pagamentos (Pix, Cartão de Crédito e Débito, Boleto Bancário, Links de Pagamento, Catálogo de Produtos, Assinaturas e Saques) voltado a prestadores de serviços e pequenas empresas brasileiras.

A interface do NextPay opera de forma 100% transparente para o cliente final, com alta conversão, liquidação rápida e conformidade com as regras do Banco Central.

---

## 🚀 Requisitos do Sistema

- **Node.js**: Versão 22.x LTS ou superior
- **npm**: Versão 10.x ou superior

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion, Lucide React
- **Backend / API**: Express, TSX, Dotenv
- **Qualidade & Testes**: ESLint (Flat Config), typescript-eslint, eslint-plugin-react-hooks, Prettier, Vitest, Testing Library, JSDOM
- **CI/CD**: GitHub Actions

---

## 📦 Instalação e Execução

### 1. Clonar e Instalar Dependências

```bash
# Instalação limpa usando o lockfile do projeto
npm ci
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo para criar seu `.env`:

```bash
cp .env.example .env
```

### 3. Executar em Modo de Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`.

### 4. Compilar para Produção

```bash
npm run build
```

---

## ⚙️ Variáveis de Ambiente

As seguintes variáveis são suportadas pelo NextPay:

| Variável | Descrição | Padrão |
| :--- | :--- | :--- |
| `PORT` | Porta onde o servidor Express ou Vite escuta conexões | `3000` |
| `APP_URL` | URL base pública da aplicação (utilizada para webhooks e links) | `http://localhost:3000` |
| `ASAAS_API_KEY` | Chave de API do gateway Asaas (somente no servidor, nunca exposta ao cliente) | - |
| `ASAAS_ENVIRONMENT` | Ambiente do gateway (`sandbox` ou `production`) | `sandbox` |
| `WEBHOOK_TOKEN` | Token de validação de autenticidade dos webhooks recebidos | - |
| `JWT_SECRET` | Chave secreta para assinatura e validação de tokens JWT | - |

> **Nota de Segurança**: Segredos e chaves de API nunca devem ser adicionados ao frontend ou versionados no Git. Todas as chamadas para gateways externos ocorrem estritamente no backend.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 |
| `npm run build` | Compila os assets do frontend para o diretório `dist/` |
| `npm run preview` | Pré-visualiza a build de produção localmente |
| `npm run typecheck` | Executa a validação estática de tipos com `tsc --noEmit` |
| `npm run lint` | Analisa o código com ESLint buscando problemas e erros de padrão |
| `npm run format` | Formata todo o código-fonte utilizando o Prettier |
| `npm test` | Executa a suíte de testes unitários com Vitest |
| `npm run clean` | Remove arquivos de build e saídas temporárias |

---

## 📐 Diretrizes e Regras de Negócio

1. **Valores Monetários**: Dinheiro é sempre armazenado e trafega como número inteiro em centavos (`amountCents: number`). A formatação em Real ocorre exclusivamente na camada de exibição visual através de `formatBRL(cents)` em `src/lib/format.ts`.
2. **Datas**: Trafegam no padrão ISO 8601 (UTC) e são formatadas no padrão brasileiro (`pt-BR`) na exibição.
3. **White-label**: A interface é totalmente personalizada para a marca NextPay, sem exibir nomes de provedores terceirizados para o pagador final.
