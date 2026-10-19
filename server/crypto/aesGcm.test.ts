import { describe, expect, it } from 'vitest';

import { decryptAes256Gcm, encryptAes256Gcm, parseEnvelope, serializeEnvelope } from './aesGcm';

const TEST_KEY = Buffer.from('0123456789abcdef0123456789abcdef', 'utf8');

describe('AES-256-GCM vault crypto', () => {
  it('roundtrip encrypt/decrypt preserves plaintext', () => {
    const plaintext = JSON.stringify({
      apiAccessToken: 'np_sec_sandbox_0123456789abcdef0123456789ab',
    });
    const envelope = encryptAes256Gcm(plaintext, TEST_KEY);
    const decrypted = decryptAes256Gcm(envelope, TEST_KEY);
    expect(decrypted).toBe(plaintext);
  });

  it('serialize/parse envelope mantém integridade', () => {
    const envelope = encryptAes256Gcm('secret', TEST_KEY);
    const parsed = parseEnvelope(serializeEnvelope(envelope));
    expect(decryptAes256Gcm(parsed, TEST_KEY)).toBe('secret');
  });

  it('falha com chave incorreta', () => {
    const envelope = encryptAes256Gcm('secret', TEST_KEY);
    const wrongKey = Buffer.from('fedcba9876543210fedcba9876543210', 'utf8');
    expect(() => decryptAes256Gcm(envelope, wrongKey)).toThrow(
      'Falha na autenticação ou decriptação',
    );
  });

  it('falha quando tag é adulterada', () => {
    const envelope = encryptAes256Gcm('secret', TEST_KEY);
    const tampered = { ...envelope, tag: Buffer.from('0'.repeat(16)).toString('base64') };
    expect(() => decryptAes256Gcm(tampered, TEST_KEY)).toThrow();
  });
});
