import { getAdminBearerToken } from './adminSession';
import { getMerchantJwt } from './merchantSession';

export function hasDashboardSession(): boolean {
  return Boolean(getMerchantJwt() || getAdminBearerToken());
}

export function dashboardAuthHeaders(contentTypeJson = true): HeadersInit {
  const merchantJwt = getMerchantJwt();
  const adminToken = getAdminBearerToken();
  const token = merchantJwt ?? adminToken;
  if (!token) {
    throw new Error('Sessão do painel não configurada.');
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentTypeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}
