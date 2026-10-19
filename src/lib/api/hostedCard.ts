export async function startHostedCard(sessionPublicId: string): Promise<{
  paymentToken: string;
  redirectUrl: string;
  amountCents: number;
  brandLabel: string;
}> {
  const response = await fetch(
    `/api/v1/public/checkout/sessions/${encodeURIComponent(sessionPublicId)}/hosted-card`,
    { method: 'POST' },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao iniciar pagamento com cartão.');
  }
  return (await response.json()) as {
    paymentToken: string;
    redirectUrl: string;
    amountCents: number;
    brandLabel: string;
  };
}

export async function fetchHostedCard(token: string): Promise<{
  token: string;
  sessionPublicId: string;
  amountCents: number;
  description: string;
  brandLabel: string;
  confirmed: boolean;
}> {
  const response = await fetch(`/api/v1/public/checkout/hosted-card/${encodeURIComponent(token)}`);
  if (!response.ok) {
    throw new Error('Token de cartão inválido ou expirado.');
  }
  const json = (await response.json()) as {
    hostedCard: {
      token: string;
      sessionPublicId: string;
      amountCents: number;
      description: string;
      brandLabel: string;
      confirmed: boolean;
    };
  };
  return json.hostedCard;
}

export async function confirmHostedCard(
  token: string,
  cardLast4: string,
  cardBrand: string,
): Promise<{ status: string; message: string }> {
  const response = await fetch(
    `/api/v1/public/checkout/hosted-card/${encodeURIComponent(token)}/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardLast4, cardBrand }),
    },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao confirmar cartão.');
  }
  return (await response.json()) as { status: string; message: string };
}
