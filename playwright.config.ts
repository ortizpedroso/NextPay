import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://127.0.0.1:3001/api/v1/health',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        PORT: '3001',
        DATABASE_URL:
          process.env.DATABASE_URL ??
          'postgresql://test_user:test_password@localhost:5432/nextpay_test?schema=public',
        PAYMENT_GATEWAY_MODE: 'fixture',
        ADMIN_API_TOKEN: 'e2e-admin-token-0123456789',
        JWT_SECRET: 'e2e-jwt-secret-0123456789abcdef',
        MERCHANT_LOGIN_EMAIL: 'lojista@nextpay.test',
        MERCHANT_LOGIN_PASSWORD: 'senha-segura-123',
        WEBHOOK_INBOUND_SECRET: 'e2e-webhook-secret-0123456789',
      },
    },
    {
      command: 'npm run dev -- --port 3000 --host 127.0.0.1',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_DEMO_MODE: 'true',
      },
    },
  ],
});
