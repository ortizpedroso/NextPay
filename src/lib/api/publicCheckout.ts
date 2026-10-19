export type PublicCheckoutPayload =
  | {
      kind: 'payment_link';
      linkPublicId: string;
      title: string;
      subtitle: string;
      billingType: 'avulsa' | 'recorrente';
      amountCents: number;
      status: string;
      checkoutUrl: string;
    }
  | {
      kind: 'product';
      productPublicId: string;
      title: string;
      description: string;
      priceCents: number;
      billingType: 'avulsa' | 'recorrente';
      maxInstallments: number;
      imageUrl: string;
      checkoutUrl: string;
    };

export async function resolvePublicCheckout(slugOrId: string): Promise<PublicCheckoutPayload> {
  const response = await fetch(
    `/api/v1/public/resolve/${encodeURIComponent(slugOrId)}`,
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Checkout não encontrado.');
  }
  const json = (await response.json()) as { checkout: PublicCheckoutPayload };
  return json.checkout;
}
