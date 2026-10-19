const MERCHANT_JWT_STORAGE_KEY = 'nextpay.merchant.jwt';

export function getMerchantJwt(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  const value = sessionStorage.getItem(MERCHANT_JWT_STORAGE_KEY);
  return value?.trim() ? value : null;
}

export function setMerchantJwt(token: string): void {
  sessionStorage.setItem(MERCHANT_JWT_STORAGE_KEY, token.trim());
}

export function clearMerchantJwt(): void {
  sessionStorage.removeItem(MERCHANT_JWT_STORAGE_KEY);
}

export async function loginMerchant(email: string, password: string): Promise<void> {
  const response = await fetch('/api/v1/merchant/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha no login.');
  }
  const json = (await response.json()) as { token: string };
  setMerchantJwt(json.token);
}
