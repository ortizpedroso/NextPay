import 'dotenv/config';

import { attachFrontend } from './http/attachFrontend';
import { createApp } from './createApp';

const port = Number(process.env.PORT ?? 3001);
const isProduction = process.env.NODE_ENV === 'production';

const app = createApp();

if (isProduction) {
  attachFrontend(app);
}

app.listen(port, '0.0.0.0', () => {
  const mode = isProduction ? 'production (API + SPA)' : 'development (API only)';
  console.info(`NextPay listening on http://0.0.0.0:${port} — ${mode}`);
});
