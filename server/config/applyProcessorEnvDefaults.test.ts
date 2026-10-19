import { describe, expect, it } from 'vitest';

import { applyProcessorEnvDefaults } from './applyProcessorEnvDefaults';

describe('applyProcessorEnvDefaults', () => {
  it('preenche URLs sandbox e produção quando vazias', () => {
    const env = {} as NodeJS.ProcessEnv;
    applyProcessorEnvDefaults(env);

    expect(env.PROCESSOR_API_BASE_URL_SANDBOX).toBe('https://sandbox.asaas.com/api/v3');
    expect(env.PROCESSOR_API_BASE_URL_PRODUCTION).toBe('https://api.asaas.com/v3');
  });

  it('não sobrescreve valores definidos pelo operador', () => {
    const env = {
      PROCESSOR_API_BASE_URL_SANDBOX: 'https://custom.example/v3',
    } as NodeJS.ProcessEnv;

    applyProcessorEnvDefaults(env);
    expect(env.PROCESSOR_API_BASE_URL_SANDBOX).toBe('https://custom.example/v3');
  });
});
