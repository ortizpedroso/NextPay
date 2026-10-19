import { randomBytes } from 'node:crypto';

export type HostedCardTokenRecord = {
  token: string;
  sessionPublicId: string;
  amountCents: number;
  description: string;
  brandLabel: string;
  createdAt: string;
  cardLast4?: string;
  cardBrand?: string;
  confirmedAt?: string;
};

const tokens = new Map<string, HostedCardTokenRecord>();

export function issueHostedCardToken(input: {
  sessionPublicId: string;
  amountCents: number;
  description: string;
}): HostedCardTokenRecord {
  const token = `hct_${randomBytes(16).toString('hex')}`;
  const record: HostedCardTokenRecord = {
    token,
    sessionPublicId: input.sessionPublicId,
    amountCents: input.amountCents,
    description: input.description,
    brandLabel: process.env.MERCHANT_DISPLAY_NAME?.trim() || 'NextPay',
    createdAt: new Date().toISOString(),
  };
  tokens.set(token, record);
  return record;
}

export function getHostedCardToken(token: string): HostedCardTokenRecord | null {
  return tokens.get(token) ?? null;
}

export function confirmHostedCardToken(
  token: string,
  cardLast4: string,
  cardBrand: string,
): HostedCardTokenRecord | null {
  const row = tokens.get(token);
  if (!row) {
    return null;
  }
  const updated: HostedCardTokenRecord = {
    ...row,
    cardLast4,
    cardBrand,
    confirmedAt: new Date().toISOString(),
  };
  tokens.set(token, updated);
  return updated;
}

/** Limpa tokens entre testes. */
export function resetHostedCardTokensForTests(): void {
  tokens.clear();
}
