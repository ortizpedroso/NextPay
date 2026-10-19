# NextPay WooCommerce (stub)

Integração mínima para receber eventos de pedido e redirecionar checkout para NextPay.

## Webhook de saída (NextPay → loja)

Configure `MERCHANT_WEBHOOK_URL` no painel NextPay apontando para:

`https://sua-loja.com/wp-json/nextpay/v1/webhook`

Payload JSON (exemplo):

```json
{
  "eventType": "PAYMENT_RECEIVED",
  "payload": { "neutralPaymentId": "np_pay_…", "amountCents": 15000 },
  "emittedAt": "2026-10-19T12:00:00.000Z"
}
```

Header recomendado: `X-NextPay-Event-Source: nextpay-platform`.

## Chave de API do lojista

Gere/rotação em `POST /api/v1/merchant/api-keys/rotate` (retorna `np_sec_…` uma única vez).

Use no plugin:

`X-NextPay-Merchant-Key: np_sec_…`

## Endpoints NextPay usados pelo plugin

- `GET /api/v1/merchant/profile`
- `POST /api/v1/public/checkout/sessions`

Homologação completa do plugin WordPress fica para fase posterior.
