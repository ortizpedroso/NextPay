import {
  decryptAes256Gcm,
  encryptAes256Gcm,
  parseEnvelope,
  serializeEnvelope,
} from '../crypto/aesGcm';
import { extractCredentialHints, maskCredentialSecret } from '../crypto/credentialMask';
import { loadMasterEncryptionKey, resolveEncryptionKeyMaterial } from '../crypto/masterKey';

export type VaultEnvironment = 'SANDBOX' | 'PRODUCTION';

export interface StoredCredentialRecord {
  environment: VaultEnvironment;
  ciphertext: string;
  prefixHint: string;
  suffixHint: string;
  rotationVersion: number;
  maskedDisplay: string;
}

export interface ProcessorCredentialPlaintext {
  apiAccessToken: string;
}

export class ProcessorCredentialVaultService {
  constructor(private readonly masterKey: Buffer) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): ProcessorCredentialVaultService {
    return new ProcessorCredentialVaultService(loadMasterEncryptionKey(env));
  }

  encryptForStorage(
    environment: VaultEnvironment,
    credential: ProcessorCredentialPlaintext,
    rotationVersion = 1,
  ): StoredCredentialRecord {
    const token = credential.apiAccessToken.trim();
    if (token.length < 16) {
      throw new Error('Token de API inválido: comprimento insuficiente.');
    }

    const keyMaterial = resolveEncryptionKeyMaterial(this.masterKey, rotationVersion);
    const envelope = encryptAes256Gcm(JSON.stringify({ apiAccessToken: token }), keyMaterial);
    const hints = extractCredentialHints(token);

    return {
      environment,
      ciphertext: serializeEnvelope(envelope),
      prefixHint: hints.prefixHint,
      suffixHint: hints.suffixHint,
      rotationVersion,
      maskedDisplay: maskCredentialSecret(hints.prefixHint, hints.suffixHint),
    };
  }

  decryptFromStorage(record: {
    ciphertext: string;
    rotationVersion: number;
  }): ProcessorCredentialPlaintext {
    const envelope = parseEnvelope(record.ciphertext);
    const keyMaterial = resolveEncryptionKeyMaterial(this.masterKey, record.rotationVersion);
    const json = decryptAes256Gcm(envelope, keyMaterial);
    const parsed = JSON.parse(json) as ProcessorCredentialPlaintext;

    if (!parsed.apiAccessToken || typeof parsed.apiAccessToken !== 'string') {
      throw new Error('Payload de credencial inválido após decriptação.');
    }

    return { apiAccessToken: parsed.apiAccessToken.trim() };
  }

  toMaskedView(record: StoredCredentialRecord): {
    environment: VaultEnvironment;
    maskedDisplay: string;
    rotationVersion: number;
  } {
    return {
      environment: record.environment,
      maskedDisplay: maskCredentialSecret(record.prefixHint, record.suffixHint),
      rotationVersion: record.rotationVersion,
    };
  }
}
