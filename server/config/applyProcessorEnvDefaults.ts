/**
 * Preenche URLs do processador primário quando omitidas no .env (somente servidor).
 * Valores padrão correspondem ao ambiente sandbox/produção do integrador documentado em DEPLOY.md.
 */

const DEFAULT_SANDBOX_BASE_URL = 'https://sandbox.asaas.com/api/v3';
const DEFAULT_PRODUCTION_BASE_URL = 'https://api.asaas.com/v3';

export function applyProcessorEnvDefaults(env: NodeJS.ProcessEnv = process.env): void {
  if (!env.PROCESSOR_API_BASE_URL_SANDBOX?.trim()) {
    env.PROCESSOR_API_BASE_URL_SANDBOX = DEFAULT_SANDBOX_BASE_URL;
  }
  if (!env.PROCESSOR_API_BASE_URL_PRODUCTION?.trim()) {
    env.PROCESSOR_API_BASE_URL_PRODUCTION = DEFAULT_PRODUCTION_BASE_URL;
  }
}

export function getDocumentedProcessorDefaults(): {
  sandbox: string;
  production: string;
} {
  return {
    sandbox: DEFAULT_SANDBOX_BASE_URL,
    production: DEFAULT_PRODUCTION_BASE_URL,
  };
}
