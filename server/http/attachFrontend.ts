import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Express } from 'express';
import express from 'express';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export function attachFrontend(app: Express): void {
  const distPath = path.resolve(moduleDir, '../../dist');
  app.use(express.static(distPath, { index: false }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'), (error) => {
      if (error) {
        next(error);
      }
    });
  });
}
