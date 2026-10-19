import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const PAYLOAD_VERSION = 1;

export interface AesGcmEnvelope {
  v: number;
  iv: string;
  tag: string;
  ct: string;
}

export function encryptAes256Gcm(plaintext: string, key: Buffer): AesGcmEnvelope {
  if (key.length !== 32) {
    throw new Error('Chave AES-256 deve ter exatamente 32 bytes.');
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_BYTES });
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: PAYLOAD_VERSION,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: ciphertext.toString('base64'),
  };
}

export function decryptAes256Gcm(envelope: AesGcmEnvelope, key: Buffer): string {
  if (envelope.v !== PAYLOAD_VERSION) {
    throw new Error('Versão de envelope criptográfico não suportada.');
  }
  if (key.length !== 32) {
    throw new Error('Chave AES-256 deve ter exatamente 32 bytes.');
  }

  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const ciphertext = Buffer.from(envelope.ct, 'base64');

  if (iv.length !== IV_BYTES) {
    throw new Error('IV inválido.');
  }
  if (tag.length !== AUTH_TAG_BYTES) {
    throw new Error('Tag de autenticação inválida.');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_BYTES });
  decipher.setAuthTag(tag);

  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch {
    throw new Error('Falha na autenticação ou decriptação do segredo (dados adulterados).');
  }
}

export function serializeEnvelope(envelope: AesGcmEnvelope): string {
  return JSON.stringify(envelope);
}

export function parseEnvelope(serialized: string): AesGcmEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error('Payload criptografado corrompido.');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as AesGcmEnvelope).v !== 'number' ||
    typeof (parsed as AesGcmEnvelope).iv !== 'string' ||
    typeof (parsed as AesGcmEnvelope).tag !== 'string' ||
    typeof (parsed as AesGcmEnvelope).ct !== 'string'
  ) {
    throw new Error('Estrutura de envelope criptográfico inválida.');
  }

  return parsed as AesGcmEnvelope;
}
