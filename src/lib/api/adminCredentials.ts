import { getAdminBearerToken } from './adminSession';

export type ApiGatewayEnvironment = 'SANDBOX' | 'PRODUCTION';

export type MaskedCredentialResponse = {
  environment: ApiGatewayEnvironment;
  maskedToken: string;
  rotationVersion: number;
  configured: boolean;
};

export type ConnectivityTestResponse = {
  environment: ApiGatewayEnvironment;
  ok: boolean;
  latencyMs: number;
  message: string;
};

export function uiEnvironmentToApi(env: 'prod' | 'sandbox'): ApiGatewayEnvironment {
  return env === 'prod' ? 'PRODUCTION' : 'SANDBOX';
}

function authHeaders(): HeadersInit {
  const token = getAdminBearerToken();
  if (!token) {
    throw new Error('Token administrativo não configurado nesta sessão.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchMaskedCredential(
  environment: ApiGatewayEnvironment,
): Promise<MaskedCredentialResponse | null> {
  const response = await fetch(`/api/v1/admin/credentials/${environment}`, {
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao carregar credencial mascarada.');
  }

  return (await response.json()) as MaskedCredentialResponse;
}

export async function upsertProcessorCredential(
  environment: ApiGatewayEnvironment,
  apiAccessToken: string,
): Promise<MaskedCredentialResponse> {
  const response = await fetch(`/api/v1/admin/credentials/${environment}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ apiAccessToken }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao salvar credencial do processador.');
  }

  return (await response.json()) as MaskedCredentialResponse;
}

export async function testProcessorConnectivity(
  environment: ApiGatewayEnvironment,
): Promise<ConnectivityTestResponse> {
  const response = await fetch(`/api/v1/admin/credentials/${environment}/test`, {
    method: 'POST',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao testar conectividade.');
  }

  return (await response.json()) as ConnectivityTestResponse;
}
