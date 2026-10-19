import http from 'node:http';

/**
 * Servidor HTTP mínimo que simula endpoints usados pelo adaptador primário (testes de integração).
 */
export function startMockProcessorHttpServer(): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && url.startsWith('/finance/balance')) {
      res.end(JSON.stringify({ balance: 1000 }));
      return;
    }

    if (req.method === 'POST' && url === '/customers') {
      res.end(
        JSON.stringify({
          id: 'mock-cus-001',
          name: 'Mock Customer',
          email: 'mock@nextpay.test',
          cpfCnpj: '39053344705',
        }),
      );
      return;
    }

    if (req.method === 'POST' && url === '/payments') {
      res.end(
        JSON.stringify({
          id: 'mock-pay-001',
          customer: 'mock-cus-001',
          billingType: 'PIX',
          value: 99,
          status: 'PENDING',
          description: 'Mock payment',
          dateCreated: new Date().toISOString(),
        }),
      );
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not_found' }));
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Falha ao iniciar mock processor.'));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
  });
}
