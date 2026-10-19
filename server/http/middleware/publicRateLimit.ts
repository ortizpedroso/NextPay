import rateLimit from 'express-rate-limit';

export const publicCheckoutRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições no checkout público. Tente novamente em instantes.',
    code: 'RATE_LIMITED',
  },
});

export const publicApiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Limite de requisições públicas excedido.',
    code: 'RATE_LIMITED',
  },
});
