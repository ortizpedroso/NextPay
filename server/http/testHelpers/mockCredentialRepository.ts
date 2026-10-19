import { vi } from 'vitest';

import type { CredentialRepositoryPort } from '../routes/adminCredentials.routes';

export function mockCredentialRepository(): CredentialRepositoryPort {
  return {
    upsertCredential: vi.fn(),
    getAdminMaskedView: vi.fn(),
    decryptCredential: vi.fn(async () => null),
    decryptApiToken: vi.fn(async () => 'np_sec_sandbox_0123456789abcdef0123456789ab'),
    markValidated: vi.fn(),
  };
}
