export interface ProductItem {
  id: string;
  checkoutUrl?: string;
  title: string;
  description: string;
  category: 'servicos' | 'digitais' | 'recorrentes' | 'projetos';
  categoryLabel: string;
  badge?: string;
  price: number;
  priceFormatted: string;
  billingType: 'avulsa' | 'recorrente';
  recurrencyCycle?: string;
  installmentsText: string;
  imageUrl: string;
  salesCount: number;
  statsText: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  subtitle: string;
  type: 'recorrente' | 'avulsa';
  typeLabel: string;
  status: 'Ativo' | 'Pausado';
  unitPrice: number;
  unitPriceFormatted: string;
  totalBilledFormatted: string;
  sales: number;
  views: number;
  conversionRate: string;
  url: string;
}

export interface Transaction {
  id: string;
  clientName: string;
  clientDoc: string;
  avatarInitials: string;
  description: string;
  code: string;
  method: 'Pix' | 'Cartão' | 'Boleto' | 'Débito';
  methodDetail: string;
  date: string;
  grossAmount: number;
  grossAmountFormatted: string;
  gatewayFeeFormatted: string;
  gatewayProfitFormatted: string;
  netAmountFormatted: string;
  status: 'Liquidado' | 'Previsto D+32' | 'Aguardando' | 'Confirmado' | 'Vencido' | 'Pendente';
  dueDate?: string;
  dueDateNote?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  code: string;
  detail: string;
  timeAgo: string;
  latencyMs: number;
  status: number;
  payload: Record<string, unknown>;
}

export interface FeeStructure {
  name: string;
  description: string;
  deadline: string;
  billingModel: string; // 'Por cobrança recebida' | 'Por boleto pago' | 'Por transação'
  anticipationNote?: string;
  anticipationRequirements?: string;
  freeTierNote?: string;
  baseCost: {
    percentage: number;
    fixed: number;
  };
  markup: {
    percentage: number; // 1%
    fixed: number; // R$ 0,49
  };
  clientRate: {
    percentage: number;
    fixed: number;
  };
}

// User Bank Account Details
export const NEXTPAY_ACCOUNT = {
  ownerName: 'NextPay Administrador',
  email: 'ortizphp@gmail.com',
  bankName: 'NextPay Instituição de Pagamento S.A',
  bankCode: '461',
  agency: '0001',
  account: '7342797-3',
  companyName: 'NextPay Intermediação & Tecnologia LTDA',
  pixKey: 'ortizphp@gmail.com',
  balance: 48920.5,
  balanceFormatted: 'R$ 48.920,50',
  gatewayProfitMonth: 4860.25,
  gatewayProfitMonthFormatted: 'R$ 4.860,25',
};

// Rates calculation:
// Custo Base de Liquidação Bancária + NextPay markup
export const FEE_TABLE: Record<string, FeeStructure> = {
  credit_single: {
    name: 'Cartão de Crédito à Vista',
    description: 'Vendas via checkout online ou links de pagamento',
    deadline: 'Receba em 32 dias',
    billingModel: 'Por transação aprovada',
    anticipationNote: 'Avulsa à vista a 1,25% ao mês (Receba em até 2 dias úteis)',
    baseCost: { percentage: 2.99, fixed: 0.49 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 3.99, fixed: 0.98 },
  },
  credit_2_6: {
    name: 'Cartão 2 a 6 parcelas',
    description: 'Parcelamento intermediário',
    deadline: 'Receba em 32 dias',
    billingModel: 'Por transação parcelada',
    anticipationNote: 'Avulsa parcelada a 1,70% ao mês (Receba em até 2 dias úteis)',
    baseCost: { percentage: 3.49, fixed: 0.49 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 4.49, fixed: 0.98 },
  },
  credit_7_12: {
    name: 'Cartão 7 a 12 parcelas',
    description: 'Parcelamento estendido',
    deadline: 'Receba em 32 dias',
    billingModel: 'Por transação parcelada',
    anticipationNote: 'Avulsa parcelada a 1,70% ao mês (Receba em até 2 dias úteis)',
    baseCost: { percentage: 3.99, fixed: 0.49 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 4.99, fixed: 0.98 },
  },
  credit_13_21: {
    name: 'Cartão 13 a 21 parcelas',
    description: 'Super parcelamento longo prazo',
    deadline: 'Receba em 32 dias',
    billingModel: 'Por transação parcelada',
    anticipationNote: 'Avulsa parcelada a 1,70% ao mês (Receba em até 2 dias úteis)',
    baseCost: { percentage: 4.29, fixed: 0.49 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 5.29, fixed: 0.98 },
  },
  debit: {
    name: 'Cartão de Débito',
    description: 'Débito online ou NextPay Tap presencial',
    deadline: 'Receba em 3 dias',
    billingModel: 'Por transação aprovada',
    baseCost: { percentage: 1.89, fixed: 0.35 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 2.89, fixed: 0.84 },
  },
  voucher: {
    name: 'Cartão Voucher',
    description: 'Alimentação e benefícios aceitos',
    deadline: 'Receba em 15 dias',
    billingModel: 'Por transação aprovada',
    baseCost: { percentage: 3.59, fixed: 0.0 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 4.59, fixed: 0.49 },
  },
  pix_dynamic: {
    name: 'Pix Dinâmico',
    description: 'Receba na hora. Por cobrança recebida.',
    deadline: 'Receba na hora',
    billingModel: 'Por cobrança recebida',
    baseCost: { percentage: 0.0, fixed: 1.99 },
    markup: { percentage: 0.0, fixed: 0.49 }, // custo 1,99 -> final R$ 2,48
    clientRate: { percentage: 0.0, fixed: 2.48 }, // R$ 2,48 por cobrança recebida
    anticipationNote: 'Antecipe a 5,79% ao mês.',
    anticipationRequirements: 'É necessário enviar nota fiscal ou o contrato do serviço.',
  },
  pix_key: {
    name: 'Pix (Chave, manual ou QR Code estático)',
    description: 'Receba na hora. Por cobrança recebida. 100 gratuitos por mês.',
    deadline: 'Receba na hora',
    billingModel: 'Por cobrança recebida',
    baseCost: { percentage: 0.0, fixed: 1.99 },
    markup: { percentage: 0.0, fixed: 0.49 }, // custo 1,99 -> final R$ 2,48
    clientRate: { percentage: 0.0, fixed: 2.48 }, // R$ 2,48 por cobrança recebida
    freeTierNote: '100 gratuitos por mês',
  },
  boleto: {
    name: 'Boleto Bancário',
    description: 'Receba em 1 dia útil. Por boleto pago.',
    deadline: 'Receba em 1 dia útil',
    billingModel: 'Por boleto pago',
    baseCost: { percentage: 0.0, fixed: 1.99 },
    markup: { percentage: 1.0, fixed: 0.49 },
    clientRate: { percentage: 1.0, fixed: 2.48 }, // 1% + R$ 2,48
    anticipationNote: 'Antecipe a 5,79% ao mês.',
    anticipationRequirements: 'É necessário enviar nota fiscal ou o contrato do serviço.',
  },
};

// Anticipation rates (maintained as requested)
export const ANTICIPATION_RATES = {
  credit_single: { ratePerMonth: 1.25, timeDays: 'Em até 2 dias úteis', label: 'Avulsa à vista' },
  credit_installment: {
    ratePerMonth: 1.7,
    timeDays: 'Em até 2 dias úteis',
    label: 'Avulsa parcelada',
  },
  pix_boleto: {
    ratePerMonth: 5.79,
    timeDays: 'Antecipação com NF ou contrato',
    label: 'Boleto / Pix antecipado',
  },
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    title: 'Consultoria Financeira Avulsa',
    description:
      'Diagnóstico detalhado de fluxo de caixa, precificação de serviços e planejamento tributário em sessão 1:1 de 90 minutos.',
    category: 'servicos',
    categoryLabel: 'Serviço',
    badge: 'Mais Vendido',
    price: 450.0,
    priceFormatted: 'R$ 450,00',
    billingType: 'avulsa',
    installmentsText: 'ou até 6x no cartão',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M',
    salesCount: 142,
    statsText: '142 cobranças liquidadas',
  },
  {
    id: 'prod-2',
    title: 'Mentoria & Acompanhamento Trimestral',
    description:
      'Cobrança automatizada no cartão ou boleto mensal. Inclui encontros quinzenais e suporte via WhatsApp Business.',
    category: 'recorrentes',
    categoryLabel: 'Assinatura Recorrente',
    badge: '3 Meses',
    price: 380.0,
    priceFormatted: 'R$ 380,00/mês',
    billingType: 'recorrente',
    recurrencyCycle: 'Ciclo de 3 meses',
    installmentsText: 'Débito recorrente',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-Fch6dWucTY4CviQh7q5y3gB9W8ddm0kwyyPkFtB3_oqeimHfHAIXWA49LAqqloYkemhDxVnLyp1RhDXzHmNIZpKDSm2c9GkjbsMFNFVOx59v5ZWR3FVjOoF_w-lrm6FTQOe1yeK_QhPIz5scomN1RPo01cdIwSbzz-txbKfyIPIoTt8Nx8Dxp3q04Q4sqELtJX_7NnF6Xx3FB__oLkrWOi5LU44gW-9hgItuzd-kxWuuiQ2E-5k',
    salesCount: 39,
    statsText: '39 clientes ativos hoje',
  },
  {
    id: 'prod-3',
    title: 'E-book & Templates de Gestão',
    description:
      'Kit completo de planilhas financeiras com entrega automatizada por e-mail e webhook logo após compensação bancária.',
    category: 'digitais',
    categoryLabel: 'Produto Digital',
    badge: 'Webhook Ativo',
    price: 97.0,
    priceFormatted: 'R$ 97,00',
    billingType: 'avulsa',
    installmentsText: 'Pix & Cartão à vista',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDC90nO-8JsodPnijZkjoami8QYRPRdgWaySkoKvDd4MhCN2Nir0cPEGFE_FeFC-sLtKOZPQbAsztM6Zk1M7LEfgsHrDFTEaY4c6j_zFAWndjmAByFp8o8kgYD-0WPKTolBGgVTzYev0hyiX_-mX2Ht-P3m5QfCORRKOB1NiUb-RYV-WpkqtacFJRfbw_mJhNLBfmeV5PdLMAkl3VYOVyECB66oGsrFh_Mhrne1tIP7_cVDeBkd4iY',
    salesCount: 531,
    statsText: '531 downloads confirmados',
  },
  {
    id: 'prod-4',
    title: 'Desenvolvimento Web & Landing Page',
    description:
      'Estruturação visual de alta conversão, código otimizado, integração com Pixel e gateway NextPay configurado.',
    category: 'servicos',
    categoryLabel: 'Projeto Sob Medida',
    price: 3200.0,
    priceFormatted: 'R$ 3.200,00',
    billingType: 'avulsa',
    installmentsText: 'Até 12x no cartão • Entrada + Saldo',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBuyIQJXrgS104egwX6vtcxZk5Vl6cQU-I-F3VG8ln5qWr04iARdxvK0P-vJREauVxHmYHkjn1yn_wY2nmYoRs-reBccbmC4GjcS9ALVQxXBODFsJA6dQxnGk2JX2ss2Gdnk6e-0_QZspaf-QkY1FOQUk-sF9N9TKPAYtdJyvCZi8Tq-bxXR_rx2uMZ3nJ262wCYDOT_xLaO9eVAIsv7IyMKoVLWfJcHR79Udhk-nW8duK1BEigKFg',
    salesCount: 18,
    statsText: '18 projetos entregues',
  },
];

export const INITIAL_PAYMENT_LINKS: PaymentLink[] = [
  {
    id: 'link-1',
    title: 'Consultoria Design UX/UI Contínua',
    subtitle: 'Suporte mensal a squads digitais e prototipação',
    type: 'recorrente',
    typeLabel: 'Recorrente Mensal',
    status: 'Ativo',
    unitPrice: 1500.0,
    unitPriceFormatted: 'R$ 1.500,00',
    totalBilledFormatted: 'R$ 21.000,00',
    sales: 14,
    views: 18,
    conversionRate: '77.7%',
    url: 'https://nextpay.link/silva-design/consultoria',
  },
  {
    id: 'link-2',
    title: 'Redesign Landing Page Institucional',
    subtitle: 'Entrega final com Figma e Handover',
    type: 'avulsa',
    typeLabel: 'Cobrança Avulsa',
    status: 'Ativo',
    unitPrice: 3800.0,
    unitPriceFormatted: 'R$ 3.800,00',
    totalBilledFormatted: 'R$ 11.400,00',
    sales: 3,
    views: 4,
    conversionRate: '75.0%',
    url: 'https://nextpay.link/silva-design/landing-page',
  },
  {
    id: 'link-3',
    title: 'Sessão Estratégica de Portfólio',
    subtitle: 'Call de 90min com análise técnica e direcionamento',
    type: 'recorrente',
    typeLabel: 'Mentoria 1-on-1',
    status: 'Ativo',
    unitPrice: 450.0,
    unitPriceFormatted: 'R$ 450,00',
    totalBilledFormatted: 'R$ 4.050,00',
    sales: 9,
    views: 11,
    conversionRate: '81.8%',
    url: 'https://nextpay.link/silva-design/mentoria',
  },
  {
    id: 'link-4',
    title: 'Identidade Visual Completa + Manual de Marca',
    subtitle: 'Branding proprietário, guia de cores e tipografia',
    type: 'avulsa',
    typeLabel: 'Cobrança Avulsa',
    status: 'Ativo',
    unitPrice: 1800.0,
    unitPriceFormatted: 'R$ 1.800,00',
    totalBilledFormatted: 'R$ 16.200,00',
    sales: 9,
    views: 12,
    conversionRate: '75.0%',
    url: 'https://nextpay.link/silva-design/branding-completo',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    clientName: 'Ana Clara Rezende',
    clientDoc: '***.482.910-**',
    avatarInitials: 'AC',
    description: 'Consultoria Brand Sprint',
    code: '#PAY-89210',
    method: 'Pix',
    methodDetail: 'Pix Dinâmico D+0',
    date: 'Hoje, 10:42',
    grossAmount: 3500.0,
    grossAmountFormatted: 'R$ 3.500,00',
    gatewayFeeFormatted: '- R$ 37,48 (1% + R$ 2,48)',
    gatewayProfitFormatted: '+ R$ 35,49 (Seu Lucro)',
    netAmountFormatted: 'R$ 3.462,52',
    status: 'Liquidado',
    dueDate: 'Hoje, 10:42',
  },
  {
    id: 'tx-2',
    clientName: 'Guilherme Mendes',
    clientDoc: '***.918.234-**',
    avatarInitials: 'GM',
    description: 'Redesign de Interface Web',
    code: '#PAY-89209',
    method: 'Cartão',
    methodDetail: 'Cartão 3x',
    date: 'Hoje, 09:15',
    grossAmount: 4200.0,
    grossAmountFormatted: 'R$ 4.200,00',
    gatewayFeeFormatted: '- R$ 189,56 (4.49% + R$ 0,98)',
    gatewayProfitFormatted: '+ R$ 42,49 (Seu Lucro)',
    netAmountFormatted: 'R$ 4.010,44',
    status: 'Previsto D+32',
    dueDate: 'Em 32 dias',
  },
  {
    id: 'tx-3',
    clientName: 'Lucas Oliveira • Studio',
    clientDoc: 'CNPJ 41.982.***',
    avatarInitials: 'LO',
    description: 'Manutenção Mensal Servidor',
    code: '#PAY-89208',
    method: 'Boleto',
    methodDetail: 'Boleto Bancário',
    date: 'Ontem, 16:50',
    grossAmount: 1250.0,
    grossAmountFormatted: 'R$ 1.250,00',
    gatewayFeeFormatted: '- R$ 14,98 (1% + R$ 2,48)',
    gatewayProfitFormatted: '+ R$ 12,99 (Seu Lucro)',
    netAmountFormatted: 'R$ 1.235,02',
    status: 'Aguardando',
    dueDate: 'Amanhã',
  },
  {
    id: 'tx-4',
    clientName: 'Priscila Barreto',
    clientDoc: '***.109.827-**',
    avatarInitials: 'PB',
    description: 'Desenvolvimento App Mobile',
    code: '#PAY-89205',
    method: 'Cartão',
    methodDetail: 'Cartão 10x',
    date: '28 Out, 14:20',
    grossAmount: 8500.0,
    grossAmountFormatted: 'R$ 8.500,00',
    gatewayFeeFormatted: '- R$ 425,13 (4.99% + R$ 0,98)',
    gatewayProfitFormatted: '+ R$ 85,49 (Seu Lucro)',
    netAmountFormatted: 'R$ 8.074,87',
    status: 'Confirmado',
    dueDate: '28 Out',
  },
  {
    id: 'tx-5',
    clientName: 'Rafael Costa',
    clientDoc: '***.331.092-**',
    avatarInitials: 'RC',
    description: 'Mentoria Individual (Hora)',
    code: '#PAY-89198',
    method: 'Boleto',
    methodDetail: 'Boleto',
    date: '25 Out, 18:00',
    grossAmount: 680.0,
    grossAmountFormatted: 'R$ 680,00',
    gatewayFeeFormatted: '- R$ 9,28',
    gatewayProfitFormatted: '+ R$ 7,29 (Seu Lucro)',
    netAmountFormatted: 'R$ 670,72',
    status: 'Vencido',
    dueDate: '27/10',
    dueDateNote: 'Vencido há 3 dias',
  },
];

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  totalBilled: string;
  chargesCount: number;
  status: string;
  city: string;
};

export const INITIAL_CLIENTS: ClientRow[] = [
  {
    id: 'cli-1',
    name: 'Ana Clara Rezende',
    email: 'ana.rezende@branding.design',
    cpfCnpj: '482.910.334-01',
    phone: '(11) 98822-1092',
    totalBilled: 'R$ 3.500,00',
    chargesCount: 2,
    status: 'Ativo',
    city: 'São Paulo - SP',
  },
  {
    id: 'cli-2',
    name: 'Guilherme Mendes',
    email: 'guilherme@mendesdev.io',
    cpfCnpj: '918.234.812-99',
    phone: '(21) 97711-4021',
    totalBilled: 'R$ 4.200,00',
    chargesCount: 3,
    status: 'Ativo',
    city: 'Rio de Janeiro - RJ',
  },
  {
    id: 'cli-3',
    name: 'Lucas Oliveira • Studio',
    email: 'financeiro@lucasstudio.com.br',
    cpfCnpj: '41.982.301/0001-44',
    phone: '(31) 99120-4499',
    totalBilled: 'R$ 6.350,00',
    chargesCount: 5,
    status: 'Ativo',
    city: 'Belo Horizonte - MG',
  },
  {
    id: 'cli-4',
    name: 'Priscila Barreto',
    email: 'priscila@appmobile.tech',
    cpfCnpj: '109.827.604-12',
    phone: '(41) 99844-3010',
    totalBilled: 'R$ 8.500,00',
    chargesCount: 1,
    status: 'Ativo',
    city: 'Curitiba - PR',
  },
  {
    id: 'cli-5',
    name: 'TechVenture Capital',
    email: 'contato@techventure.vc',
    cpfCnpj: '35.819.400/0001-90',
    phone: '(11) 3201-9900',
    totalBilled: 'R$ 14.500,00',
    chargesCount: 4,
    status: 'Ativo',
    city: 'São Paulo - SP',
  },
];

export const INITIAL_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'wh-1',
    event: 'PAYMENT_RECEIVED',
    code: 'pay_89123049102',
    detail: 'Pix R$ 450,00 - Consultoria',
    timeAgo: 'Há 2 min',
    latencyMs: 142,
    status: 200,
    payload: {
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_89123049102',
        value: 450.0,
        netValue: 443.02,
        gatewayProfit: 4.99,
        billingType: 'PIX',
        status: 'RECEIVED',
        account: '7342797-3',
        bank: '461 - NextPay I.P S.A',
        confirmedDate: new Date().toISOString(),
      },
    },
  },
  {
    id: 'wh-2',
    event: 'PAYMENT_RECEIVED',
    code: 'pay_78291040184',
    detail: 'Cartão R$ 1.250,00 - 3x',
    timeAgo: 'Há 7 min',
    latencyMs: 198,
    status: 200,
    payload: {
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_78291040184',
        value: 1250.0,
        netValue: 1192.89,
        gatewayProfit: 12.99,
        billingType: 'CREDIT_CARD',
        installmentCount: 3,
        status: 'RECEIVED',
      },
    },
  },
  {
    id: 'wh-3',
    event: 'PAYMENT_OVERDUE',
    code: 'pay_19284729103',
    detail: 'Boleto R$ 89,00',
    timeAgo: 'Há 19 min',
    latencyMs: 110,
    status: 200,
    payload: {
      event: 'PAYMENT_OVERDUE',
      payment: {
        id: 'pay_19284729103',
        value: 89.0,
        billingType: 'BOLETO',
        status: 'OVERDUE',
      },
    },
  },
  {
    id: 'wh-4',
    event: 'PAYMENT_RECEIVED',
    code: 'pay_67281039401',
    detail: 'Pix R$ 120,00',
    timeAgo: 'Há 26 min',
    latencyMs: 134,
    status: 200,
    payload: {
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_67281039401',
        value: 120.0,
        billingType: 'PIX',
        status: 'RECEIVED',
      },
    },
  },
  {
    id: 'wh-5',
    event: 'PAYMENT_REFUNDED',
    code: 'pay_00192837492',
    detail: 'Estorno R$ 75,00',
    timeAgo: 'Há 41 min',
    latencyMs: 221,
    status: 200,
    payload: {
      event: 'PAYMENT_REFUNDED',
      payment: {
        id: 'pay_00192837492',
        value: 75.0,
        status: 'REFUNDED',
      },
    },
  },
];
