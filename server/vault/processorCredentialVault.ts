import {
  decryptAes256Gcm,
  encryptAes256Gcm,
  parseEnvelope,
  serializeEnvelope,
} from '../crypto/aesGcm';
import { extractCredentialHints, maskCredentialSecret } from '../crypto/credentialMask';
import { loadMasterEncryptionKey, resolveEncryptionKeyMaterial } from '../crypto/masterKey';

export type VaultEnvironment = 'SANDBOX' | 'PRODUCTION';

export interface ProcessorCredentialPlaintext {
  apiAccessToken: string;
  webhookToken?: string;
  walletId?: string;
}

export type ProcessorCredentialUpsertPatch = {
  apiAccessToken?: string;
  webhookToken?: string;
  walletId?: string;
};

export interface StoredCredentialRecord {
  environment: VaultEnvironment;
  ciphertext: string;
  prefixHint: string;
  suffixHint: string;
  rotationVersion: number;
  maskedDisplay: string;
}

export interface AdminCredentialMaskedView {
  environment: VaultEnvironment;
  maskedApiToken: string;
  maskedWebhookToken: string | null;
  maskedWalletId: string | null;
  configuredApi: boolean;
  configuredWebhook: boolean;
  configuredWallet: boolean;
  rotationVersion: number;
}

export class ProcessorCredentialVaultService {
  constructor(private readonly masterKey: Buffer) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): ProcessorCredentialVaultService {
    return new ProcessorCredentialVaultService(loadMasterEncryptionKey(env));
  }

  maskSecretValue(value: string | undefined): string | null {
    if (!value?.trim()) {
      return null;
    }
    const hints = extractCredentialHints(value);
    return maskCredentialSecret(hints.prefixHint, hints.suffixHint);
  }

  toAdminMaskedView(
    environment: VaultEnvironment,
    plaintext: ProcessorCredentialPlaintext,
    rotationVersion: number,
  ): AdminCredentialMaskedView {
    const apiToken = plaintext.apiAccessToken.trim();
    const apiHints = extractCredentialHints(apiToken);

    return {
      environment,
      maskedApiToken: maskCredentialSecret(apiHints.prefixHint, apiHints.suffixHint),
      maskedWebhookToken: this.maskSecretValue(plaintext.webhookToken),
      maskedWalletId: this.maskSecretValue(plaintext.walletId),
      configuredApi: apiToken.length >= 16,
      configuredWebhook: Boolean(plaintext.webhookToken?.trim()),
      configuredWallet: Boolean(plaintext.walletId?.trim()),
      rotationVersion,
    };
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

    const payload: ProcessorCredentialPlaintext = {
      apiAccessToken: token,
    };
    const webhook = credential.webhookToken?.trim();
    if (webhook) {
      if (webhook.length < 8) {
        throw new Error('Token de webhook inválido: comprimento insuficiente.');
      }
      payload.webhookToken = webhook;
    }
    const walletId = credential.walletId?.trim();
    if (walletId) {
      payload.walletId = walletId;
    }

    const keyMaterial = resolveEncryptionKeyMaterial(this.masterKey, rotationVersion);
    const envelope = encryptAes256Gcm(JSON.stringify(payload), keyMaterial);
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

    const result: ProcessorCredentialPlaintext = {
      apiAccessToken: parsed.apiAccessToken.trim(),
    };
    if (typeof parsed.webhookToken === 'string' && parsed.webhookToken.trim()) {
      result.webhookToken = parsed.webhookToken.trim();
    }
    if (typeof parsed.walletId === 'string' && parsed.walletId.trim()) {
      result.walletId = parsed.walletId.trim();
    }
    return result;
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
