const DEFAULT_VISIBLE_SUFFIX = 4;
const MASK_CHAR = '•';

/**
 * Mascara segredos para exibição administrativa (ex.: sk_live_••••••••••••4f8a).
 */
export function maskCredentialSecret(
  prefixHint: string,
  suffixHint: string,
  minMaskLength = 12,
): string {
  const safePrefix = prefixHint.trim() || 'sk';
  const safeSuffix = suffixHint.trim().slice(-DEFAULT_VISIBLE_SUFFIX);
  const maskBody = MASK_CHAR.repeat(Math.max(minMaskLength, 8));
  const needsUnderscore = safePrefix.endsWith('_') ? '' : '_';
  return `${safePrefix}${needsUnderscore}${maskBody}${safeSuffix}`;
}

export function extractCredentialHints(apiKey: string): { prefixHint: string; suffixHint: string } {
  const trimmed = apiKey.trim();
  if (trimmed.length < 8) {
    return { prefixHint: 'sk', suffixHint: trimmed.slice(-4) || '0000' };
  }

  const prefixMatch = trimmed.match(/^(np_sec_(?:sandbox|production)|sk_(?:test|live|sandbox))/i);
  const prefixHint = prefixMatch ? prefixMatch[1] : trimmed.slice(0, Math.min(8, trimmed.length));

  return {
    prefixHint,
    suffixHint: trimmed.slice(-DEFAULT_VISIBLE_SUFFIX),
  };
}
