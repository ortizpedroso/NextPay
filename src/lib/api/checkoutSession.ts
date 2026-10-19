export type CheckoutMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO';

export type CheckoutSessionResponse = {
  sessionPublicId: string;
  status: string;
  paymentId?: string | null;
  pixCopyPaste?: string | null;
  amountCents: number;
  method: CheckoutMethod;
};

export async function createCheckoutSession(input: {
  amountCents: number;
  description: string;
  method: CheckoutMethod;
  paymentLinkPublicId?: string;
  productPublicId?: string;
  customer: { name: string; email: string; document: string };
}): Promise<CheckoutSessionResponse> {
  const response = await fetch('/api/v1/public/checkout/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountCents: input.amountCents,
      description: input.description,
      method: input.method,
      paymentLinkPublicId: input.paymentLinkPublicId,
      productPublicId: input.productPublicId,
      customer: input.customer,
      environment: 'SANDBOX',
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao iniciar checkout.');
  }

  const json = (await response.json()) as { session: CheckoutSessionResponse };
  return json.session;
}

export async function getCheckoutSession(
  sessionPublicId: string,
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`/api/v1/public/checkout/sessions/${sessionPublicId}`);
  if (!response.ok) {
    throw new Error('Sessão de checkout não encontrada.');
  }
  const json = (await response.json()) as { session: CheckoutSessionResponse };
  return json.session;
}
