export type FeeScheduleEntry = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  billingModel: string;
  anticipationNote?: string;
  baseCost: { percentage: number; fixedCents: number };
  markup: { percentage: number; fixedCents: number };
  clientRate: { percentage: number; fixedCents: number };
};

export const FEE_SCHEDULE: FeeScheduleEntry[] = [
  {
    id: 'credit_single',
    name: 'Cartão de Crédito à Vista',
    description: 'Vendas via checkout online ou links de pagamento',
    deadline: 'Receba em 32 dias',
    billingModel: 'Por transação aprovada',
    anticipationNote: 'Avulsa à vista a 1,25% ao mês (Receba em até 2 dias úteis)',
    baseCost: { percentage: 2.99, fixedCents: 49 },
    markup: { percentage: 1.0, fixedCents: 49 },
    clientRate: { percentage: 3.99, fixedCents: 98 },
  },
  {
    id: 'pix',
    name: 'Pix',
    description: 'Liquidação instantânea D+0',
    deadline: 'Receba em instantes',
    billingModel: 'Por cobrança recebida',
    baseCost: { percentage: 0.99, fixedCents: 49 },
    markup: { percentage: 1.0, fixedCents: 49 },
    clientRate: { percentage: 1.99, fixedCents: 98 },
  },
  {
    id: 'boleto',
    name: 'Boleto bancário',
    description: 'Compensação bancária padrão',
    deadline: 'Receba em 2 dias úteis após compensação',
    billingModel: 'Por boleto pago',
    baseCost: { percentage: 0, fixedCents: 199 },
    markup: { percentage: 0, fixedCents: 49 },
    clientRate: { percentage: 0, fixedCents: 248 },
  },
];
