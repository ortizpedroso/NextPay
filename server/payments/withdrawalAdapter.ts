export type WithdrawalStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type WithdrawalRecord = {
  protocol: string;
  amountCents: number;
  pixKey: string;
  status: WithdrawalStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export interface WithdrawalAdapter {
  submit(input: { amountCents: number; pixKey: string; protocol: string }): Promise<{
    status: WithdrawalStatus;
    message: string;
  }>;
}

export class FixtureWithdrawalAdapter implements WithdrawalAdapter {
  async submit(): Promise<{ status: WithdrawalStatus; message: string }> {
    return {
      status: 'QUEUED',
      message:
        'Saque enfileirado (simulado). Conclusão automática após alguns segundos em ambiente fixture.',
    };
  }
}

export class ProductionWithdrawalAdapter implements WithdrawalAdapter {
  async submit(): Promise<{ status: WithdrawalStatus; message: string }> {
    return {
      status: 'PROCESSING',
      message:
        'Saque enviado ao processador (stub). Integração Pix-out real exige contrato bancário e credenciais PRODUCTION.',
    };
  }
}

export function resolveWithdrawalAdapter(
  env: NodeJS.ProcessEnv = process.env,
): WithdrawalAdapter {
  const mode = env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
  if (mode === 'fixture' || mode === 'in_memory') {
    return new FixtureWithdrawalAdapter();
  }
  const gatewayEnv = env.ASAAS_ENV?.trim().toLowerCase();
  if (gatewayEnv === 'production' || gatewayEnv === 'prod') {
    return new ProductionWithdrawalAdapter();
  }
  return new FixtureWithdrawalAdapter();
}
