export const DEMO_ACCOUNT_ID = 'demo-account-1';

/**
 * Retorna o ID da conta atual autenticada.
 * Na Fase 1 (sem login), retorna a conta padrão de demonstração.
 * Na Fase 2, esta função será conectada à sessão/token de autenticação.
 */
export function getCurrentAccountId(): string {
  return DEMO_ACCOUNT_ID;
}
