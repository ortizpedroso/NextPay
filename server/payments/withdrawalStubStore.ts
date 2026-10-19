export type WithdrawalStubRecord = {
  protocol: string;
  amountCents: number;
  pixKey: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  message: string;
};

const rows = new Map<string, WithdrawalStubRecord>();

export function enqueueWithdrawalStub(input: {
  amountCents: number;
  pixKey: string;
}): WithdrawalStubRecord {
  const protocol = `wd_${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const record: WithdrawalStubRecord = {
    protocol,
    amountCents: input.amountCents,
    pixKey: input.pixKey,
    status: 'QUEUED',
    createdAt: now,
    updatedAt: now,
    message: 'Saque enfileirado (stub). Integração Pix de saque exige credenciais do processador.',
  };
  rows.set(protocol, record);
  return record;
}

export function getWithdrawalStub(protocol: string): WithdrawalStubRecord | null {
  const row = rows.get(protocol);
  if (!row) {
    return null;
  }

  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  if (row.status === 'QUEUED' && ageMs > 2_000) {
    row.status = 'PROCESSING';
    row.updatedAt = new Date().toISOString();
    row.message = 'Liquidação Pix em processamento (stub).';
  }
  if (row.status === 'PROCESSING' && ageMs > 5_000) {
    row.status = 'COMPLETED';
    row.updatedAt = new Date().toISOString();
    row.message = 'Saque concluído em ambiente simulado.';
  }
  return row;
}

export function listWithdrawalStubs(): WithdrawalStubRecord[] {
  return [...rows.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resetWithdrawalStubStoreForTests(): void {
  rows.clear();
}
