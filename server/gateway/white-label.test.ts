import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { InMemoryPaymentGateway } from './adapters/in-memory-gateway.adapter';

const FORBIDDEN = [/asaas/i, /sandbox\.asaas/i, /api\.asaas\.com/i];

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'infra') {
        continue;
      }
      files.push(...collectFiles(full));
    } else if (full.endsWith('.ts') && !full.includes('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}

describe('White-label public gateway surface', () => {
  it('public-api e DTOs não contêm termos proibidos', () => {
    const gatewayRoot = join(process.cwd(), 'server/gateway');
    const files = collectFiles(gatewayRoot).filter((file) => !file.includes('.test.'));
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN) {
        expect(content, file).not.toMatch(pattern);
      }
    }
  });

  it('PaymentRecord serializado não vaza identificadores da processadora', async () => {
    const gateway = new InMemoryPaymentGateway('SANDBOX');
    const customer = await gateway.createCustomer({
      name: 'Cliente Teste',
      email: 'cliente@example.com',
      document: '39053344705',
    });

    const payment = await gateway.createPayment({
      amountCents: 45000,
      method: 'PIX',
      description: 'Serviço',
      customerId: customer.customerId,
      idempotencyKey: 'idem-abcdef01',
    });

    const serialized = JSON.stringify(payment);
    for (const pattern of FORBIDDEN) {
      expect(serialized).not.toMatch(pattern);
    }
    expect(serialized).toContain('np_');
  });
});
