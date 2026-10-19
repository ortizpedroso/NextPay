import 'dotenv/config';

import { applyProcessorEnvDefaults } from './config/applyProcessorEnvDefaults';
import { seedProcessorVaultFromEnvIfNeeded } from './bootstrap/seedProcessorVaultFromEnv';
import { attachFrontend } from './http/attachFrontend';
import { createApp } from './createApp';

applyProcessorEnvDefaults();

const port = Number(process.env.PORT ?? 3001);
const isProduction = process.env.NODE_ENV === 'production';

async function start(): Promise<void> {
  try {
    const seedResult = await seedProcessorVaultFromEnvIfNeeded();
    if (seedResult.status === 'seeded') {
      console.info(
        `[bootstrap] Credencial do processador (${seedResult.environment}) carregada do ambiente para o vault.`,
      );
    }
  } catch (error) {
    console.error('[bootstrap] Falha ao inicializar vault a partir de ASAAS_API_KEY:', error);
    process.exit(1);
  }

  const app = createApp();

  if (isProduction) {
    attachFrontend(app);
  }

  app.listen(port, '0.0.0.0', () => {
    const mode = isProduction ? 'production (API + SPA)' : 'development (API only)';
    console.info(`NextPay listening on http://0.0.0.0:${port} — ${mode}`);
  });
}

void start();
