import 'dotenv/config';

import { applyProcessorEnvDefaults } from '../server/config/applyProcessorEnvDefaults';
import { seedProcessorVaultFromEnvIfNeeded } from '../server/bootstrap/seedProcessorVaultFromEnv';

applyProcessorEnvDefaults();

const result = await seedProcessorVaultFromEnvIfNeeded();

if (result.status === 'seeded') {
  console.info(`Vault do processador gravado para ${result.environment} a partir de ASAAS_API_KEY.`);
  process.exit(0);
}

console.info(`Seed ignorado: ${result.reason}`);
process.exit(0);
