import { createHash } from 'node:crypto';

const REQUIRED_KEY_BYTES = 32;

/**
 * Resolve a chave mestra de criptografia a partir de MASTER_ENCRYPTION_KEY.
 * Aceita Base64 (44 chars típico) ou hex (64 chars). Nunca logar o valor.
 */
export function hasMasterEncryptionKey(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.MASTER_ENCRYPTION_KEY?.trim());
}

export function loadMasterEncryptionKey(env: NodeJS.ProcessEnv = process.env): Buffer {
  const raw = env.MASTER_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error('MASTER_ENCRYPTION_KEY não configurada no ambiente do servidor.');
  }

  const fromBase64 = tryDecodeBase64Key(raw);
  if (fromBase64) {
    return fromBase64;
  }

  const fromHex = tryDecodeHexKey(raw);
  if (fromHex) {
    return fromHex;
  }

  throw new Error(
    'MASTER_ENCRYPTION_KEY inválida: use 32 bytes em Base64 ou 64 caracteres hexadecimais.',
  );
}

function tryDecodeBase64Key(raw: string): Buffer | null {
  try {
    const buf = Buffer.from(raw, 'base64');
    if (buf.length !== REQUIRED_KEY_BYTES) {
      return null;
    }
    return buf;
  } catch {
    return null;
  }
}

function tryDecodeHexKey(raw: string): Buffer | null {
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    return null;
  }
  const buf = Buffer.from(raw, 'hex');
  if (buf.length !== REQUIRED_KEY_BYTES) {
    return null;
  }
  return buf;
}

/**
 * Deriva uma chave alternativa durante rotação (HKDF simplificado via SHA-256).
 * rotationVersion 1 usa a chave mestra direta; versões > 1 derivam material distinto.
 */
export function resolveEncryptionKeyMaterial(masterKey: Buffer, rotationVersion: number): Buffer {
  if (rotationVersion <= 1) {
    return masterKey;
  }
  return createHash('sha256')
    .update(masterKey)
    .update('nextpay-vault-rotation-v')
    .update(String(rotationVersion))
    .digest();
}
