const ADMIN_BEARER_STORAGE_KEY = 'nextpay.admin.bearer';

export function getAdminBearerToken(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  const value = sessionStorage.getItem(ADMIN_BEARER_STORAGE_KEY);
  return value?.trim() ? value : null;
}

export function setAdminBearerToken(token: string): void {
  sessionStorage.setItem(ADMIN_BEARER_STORAGE_KEY, token.trim());
}

export function clearAdminBearerToken(): void {
  sessionStorage.removeItem(ADMIN_BEARER_STORAGE_KEY);
}
