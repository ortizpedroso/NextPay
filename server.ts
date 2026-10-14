import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';

import { healthRouter } from './server/routes/health.route.js';
import { accountRouter } from './server/routes/account.route.js';
import { productsRouter } from './server/routes/products.route.js';
import { customersRouter } from './server/routes/customers.route.js';
import { paymentLinksRouter } from './server/routes/paymentLinks.route.js';
import { chargesRouter } from './server/routes/charges.route.js';
import { dashboardRouter } from './server/routes/dashboard.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

function resolvePort(): number {
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  if (process.env.APP_PORT) {
    const parsed = parseInt(process.env.APP_PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  if (process.env.DEFAULT_APP_PORT) {
    return parseInt(process.env.DEFAULT_APP_PORT, 10);
  }

  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return 3000;
}

const PORT = resolvePort();

// Middleware de parsing JSON
app.use(express.json());

// Log central de cada requisição
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
});

// Rotas da API REST
app.use('/api', healthRouter);
app.use('/api', accountRouter);
app.use('/api', productsRouter);
app.use('/api', customersRouter);
app.use('/api', paymentLinksRouter);
app.use('/api', chargesRouter);
app.use('/api', dashboardRouter);

// Tratamento central de erros
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Erro interno do servidor';
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({ error: message });
});

export async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite em modo middleware durante o desenvolvimento
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Servir arquivos estáticos de dist/ com fallback para index.html
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `🚀 Servidor NextPay rodando em http://localhost:${PORT} (Modo: ${isProd ? 'produção' : 'desenvolvimento'})`,
    );
  });
}

// Iniciar servidor quando executado diretamente (fora de testes)
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer().catch((err) => {
    console.error('Falha ao iniciar o servidor NextPay:', err);
    process.exit(1);
  });
}
