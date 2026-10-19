import type { IncomingHttpHeaders } from 'node:http';

function headerValue(headers: IncomingHttpHeaders, name: string): string | undefined {
  const raw = headers[name.toLowerCase()];
  if (raw === undefined) {
    return undefined;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || undefined;
}

export function resolveInboundWebhookSecrets(env: NodeJS.ProcessEnv = process.env): string[] {
  const secrets = new Set<string>();
  const inbound = env.WEBHOOK_INBOUND_SECRET?.trim();
  if (inbound) {
    secrets.add(inbound);
  }
  const legacyAlias = env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (legacyAlias) {
    secrets.add(legacyAlias);
  }
  return [...secrets];
}

/**
 * Aceita `x-nextpay-webhook-token` (genérico) ou `asaas-access-token` (cabeçalho do painel Asaas).
 */
export function verifyInboundWebhookAuth(
  headers: IncomingHttpHeaders,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const allowed = resolveInboundWebhookSecrets(env);
  if (allowed.length === 0) {
    return false;
  }

  const provided =
    headerValue(headers, 'x-nextpay-webhook-token') ?? headerValue(headers, 'asaas-access-token');

  if (!provided) {
    return false;
  }

  return allowed.includes(provided);
}
