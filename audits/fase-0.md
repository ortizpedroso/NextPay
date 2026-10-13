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
   regra 8 (nenhum botão fingindo funcionar). "Flapp Store" parece ser nome de outra marca.
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
     abrir tela: Antecipações, Consulta Serasa & Negativação, Notas Fiscais, Pague Contas (serão
     implementados na Fase 7); Simular Venda, Vendas Físicas (Tap), Cartão NextPay, Open Finance,
     Benefícios & Indique e a loja de aplicativos (fora do escopo atual).
   - Remova o nome "Flapp" de todo o código; a loja de aplicativos se chama "Loja NextPay".
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

8. Nome: em todo texto visível ao usuário (telas, títulos, README, index.html, metadata.json,
   comprovantes) o nome é exatamente "NextPay". Nomes de código seguem a convenção
   (nextpay, NEXTPAY_...).

Critério de pronto: `npm ci && npm run typecheck && npm run lint && npx prettier --check . &&
npm test && npm run build` sem erros; nenhum toast de sucesso falso; CI rodando no GitHub.
Salve na branch ai-studio/fase-0-correcoes (NÃO na main).
```

## Atualização do contexto (colar antes do prompt de correção)

```text
ATUALIZAÇÃO DO CONTEXTO: substitua o contexto mestre anterior pelo texto abaixo. Mudanças: stack
fixa (React + Vite + Express + Prisma + PostgreSQL), estrutura de pastas alvo, modelo de negócio
com subcontas Asaas por lojista e comissão do NextPay via split, e nome sempre "NextPay".
Não altere nada agora; responda apenas "Contexto atualizado" e aguarde.

[cole aqui o Contexto mestre atual de prompts/google-ai-studio.md]
```
