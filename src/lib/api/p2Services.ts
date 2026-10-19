import { dashboardAuthHeaders } from './dashboardAuth';

export async function quoteAntecipacao(receivableCents: number) {
  const response = await fetch('/api/v1/services/antecipacao/quote', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify({ receivableCents }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha na cotação.');
  }
  return (await response.json()) as {
    quote: {
      receivableCents: number;
      feePercent: number;
      feeCents: number;
      netCents: number;
      settlementEtaHours: number;
      stub: boolean;
    };
  };
}

export async function registerTapDevice(input: { label: string; serialNumber?: string }) {
  const response = await fetch('/api/v1/services/tap/devices', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao registrar dispositivo.');
  }
  return (await response.json()) as {
    device: { devicePublicId: string; label: string; status: string; stub: boolean };
  };
}

export async function requestNotaFiscalEmit(input: {
  customerName: string;
  customerDocument: string;
  amountCents: number;
  description: string;
}) {
  const response = await fetch('/api/v1/services/notas-fiscais/emit', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao solicitar NF.');
  }
  return (await response.json()) as {
    request: { protocol: string; status: string; message: string; stub: boolean };
  };
}
