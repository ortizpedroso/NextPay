import { describe, expect, it } from 'vitest';

import { loadMasterEncryptionKey } from '../crypto/masterKey';
import { ProcessorCredentialVaultService } from './processorCredentialVault';

const MASTER_B64 = Buffer.from('a'.repeat(32)).toString('base64');

describe('ProcessorCredentialVaultService', () => {
  it('criptografa e decriptografa token de API', () => {
    const vault = new ProcessorCredentialVaultService(
      loadMasterEncryptionKey({
        MASTER_ENCRYPTION_KEY: MASTER_B64,
      } as NodeJS.ProcessEnv),
    );

    const stored = vault.encryptForStorage('SANDBOX', {
      apiAccessToken: 'np_sec_sandbox_0123456789abcdef0123456789ab',
    });

    expect(stored.maskedDisplay).toMatch(/np_sec/);
    expect(stored.maskedDisplay).toMatch(/9ab$/);

    const decrypted = vault.decryptFromStorage({
      ciphertext: stored.ciphertext,
      rotationVersion: stored.rotationVersion,
    });

    expect(decrypted.apiAccessToken).toBe('np_sec_sandbox_0123456789abcdef0123456789ab');
  });

  it('suporta rotação de chave derivada por versão', () => {
    const vault = new ProcessorCredentialVaultService(
      loadMasterEncryptionKey({
        MASTER_ENCRYPTION_KEY: MASTER_B64,
      } as NodeJS.ProcessEnv),
    );

    const v2 = vault.encryptForStorage(
      'PRODUCTION',
      { apiAccessToken: 'np_sec_production_0123456789abcdef0123456789ab' },
      2,
    );

    const decrypted = vault.decryptFromStorage({
      ciphertext: v2.ciphertext,
      rotationVersion: 2,
    });
    expect(decrypted.apiAccessToken).toContain('production');
  });

  it('rejeita token curto', () => {
    const vault = ProcessorCredentialVaultService.fromEnvironment({
      MASTER_ENCRYPTION_KEY: MASTER_B64,
    } as NodeJS.ProcessEnv);

    expect(() => vault.encryptForStorage('SANDBOX', { apiAccessToken: 'short' })).toThrow(
      'comprimento insuficiente',
    );
  });
});
