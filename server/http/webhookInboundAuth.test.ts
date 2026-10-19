import { describe, expect, it } from 'vitest';

import { resolveInboundWebhookSecrets, verifyInboundWebhookAuth } from './webhookInboundAuth';

describe('webhookInboundAuth', () => {
  it('aceita x-nextpay-webhook-token', () => {
    const env = {
      WEBHOOK_INBOUND_SECRET: 'secret-abc',
    } as NodeJS.ProcessEnv;

    expect(
      verifyInboundWebhookAuth({ 'x-nextpay-webhook-token': 'secret-abc' }, env),
    ).toBe(true);
  });

  it('aceita asaas-access-token com o mesmo segredo', () => {
    const env = {
      WEBHOOK_INBOUND_SECRET: 'secret-abc',
    } as NodeJS.ProcessEnv;

    expect(verifyInboundWebhookAuth({ 'asaas-access-token': 'secret-abc' }, env)).toBe(true);
  });

  it('rejeita token inválido', () => {
    const env = {
      WEBHOOK_INBOUND_SECRET: 'secret-abc',
    } as NodeJS.ProcessEnv;

    expect(verifyInboundWebhookAuth({ 'asaas-access-token': 'wrong' }, env)).toBe(false);
  });

  it('aceita segredos extras do vault', () => {
    expect(
      verifyInboundWebhookAuth(
        { 'asaas-access-token': 'from-vault-only' },
        {},
        ['from-vault-only'],
      ),
    ).toBe(true);
  });

  it('unifica WEBHOOK_INBOUND_SECRET e ASAAS_WEBHOOK_TOKEN', () => {
    const env = {
      WEBHOOK_INBOUND_SECRET: 'primary',
      ASAAS_WEBHOOK_TOKEN: 'alias',
    } as NodeJS.ProcessEnv;

    expect(resolveInboundWebhookSecrets(env)).toEqual(['primary', 'alias']);
  });
});
