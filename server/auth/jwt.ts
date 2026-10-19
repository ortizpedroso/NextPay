import { createHmac, timingSafeEqual } from 'node:crypto';

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export type MerchantJwtClaims = {
  sub: string;
  merchantId: string;
  email: string;
  role: 'merchant';
};

export function signMerchantJwt(
  claims: MerchantJwtClaims,
  secret: string,
  ttlSeconds = 60 * 60 * 12,
): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      ...claims,
      iat: now,
      exp: now + ttlSeconds,
    }),
  );
  const signature = base64UrlEncode(
    createHmac('sha256', secret).update(`${header}.${payload}`).digest(),
  );
  return `${header}.${payload}.${signature}`;
}

export function verifyMerchantJwt(token: string, secret: string): MerchantJwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [header, payload, signature] = parts;
  const expected = base64UrlEncode(
    createHmac('sha256', secret).update(`${header}.${payload}`).digest(),
  );
  try {
    const a = Buffer.from(signature, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }

  let parsed: { sub?: string; email?: string; role?: string; exp?: number };
  try {
    parsed = JSON.parse(base64UrlDecode(payload).toString('utf8')) as typeof parsed;
  } catch {
    return null;
  }

  const merchantId =
    typeof (parsed as { merchantId?: string }).merchantId === 'string'
      ? (parsed as { merchantId: string }).merchantId
      : parsed.sub;

  if (parsed.role !== 'merchant' || !parsed.sub || !parsed.email || !merchantId) {
    return null;
  }
  if (typeof parsed.exp === 'number' && parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { sub: parsed.sub, merchantId, email: parsed.email, role: 'merchant' };
}
