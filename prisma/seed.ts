import {
  PrismaClient,
  BillingType,
  PaymentMethod,
  ChargeStatus,
  SubscriptionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Iniciando seed do NextPay...');

  const accountId = 'demo-account-1';

  // 1. Conta Principal NextPay
  const _account = await prisma.account.upsert({
    where: { id: accountId },
    update: {
      name: 'NextPay Administrador',
      email: 'ortizphp@gmail.com',
      cpfCnpj: '12.345.678/0001-90',
      phone: '(11) 98822-1092',
      bankName: 'NextPay Instituição de Pagamento S.A',
      bankCode: '461',
      agency: '0001',
      account: '7342797-3',
      accountType: 'Conta Pagamento',
      pixKey: 'ortizphp@gmail.com',
      balanceCents: 4892050, // R$ 48.920,50
    },
    create: {
      id: accountId,
      name: 'NextPay Administrador',
      email: 'ortizphp@gmail.com',
      cpfCnpj: '12.345.678/0001-90',
      phone: '(11) 98822-1092',
      bankName: 'NextPay Instituição de Pagamento S.A',
      bankCode: '461',
      agency: '0001',
      account: '7342797-3',
      accountType: 'Conta Pagamento',
      pixKey: 'ortizphp@gmail.com',
      balanceCents: 4892050,
    },
  });

  // 2. Clientes
  const customersData = [
    {
      id: 'cli-1',
      accountId,
      name: 'Ana Clara Rezende',
      email: 'ana.rezende@branding.design',
      cpfCnpj: '482.910.334-01',
      phone: '(11) 98822-1092',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      id: 'cli-2',
      accountId,
      name: 'Guilherme Mendes',
      email: 'guilherme@mendesdev.io',
      cpfCnpj: '918.234.812-99',
      phone: '(21) 97711-4021',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      id: 'cli-3',
      accountId,
      name: 'Lucas Oliveira • Studio',
      email: 'financeiro@lucasstudio.com.br',
      cpfCnpj: '41.982.301/0001-44',
      phone: '(31) 99120-4499',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      id: 'cli-4',
      accountId,
      name: 'Priscila Barreto',
      email: 'priscila@appmobile.tech',
      cpfCnpj: '109.827.604-12',
      phone: '(41) 99844-3010',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      id: 'cli-5',
      accountId,
      name: 'TechVenture Capital',
      email: 'contato@techventure.vc',
      cpfCnpj: '35.819.400/0001-90',
      phone: '(11) 3201-9900',
      city: 'São Paulo',
      state: 'SP',
    },
  ];

  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // 3. Produtos
  const productsData = [
    {
      id: 'prod-1',
      accountId,
      title: 'Consultoria Financeira Avulsa',
      description:
        'Diagnóstico detalhado de fluxo de caixa, precificação de serviços e planejamento tributário em sessão 1:1 de 90 minutos.',
      category: 'servicos',
      priceCents: 45000, // R$ 450,00
      billingType: BillingType.avulsa,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M',
      active: true,
    },
    {
      id: 'prod-2',
      accountId,
      title: 'Mentoria & Acompanhamento Trimestral',
      description:
        'Cobrança automatizada no cartão ou boleto mensal. Inclui encontros quinzenais e suporte via WhatsApp Business.',
      category: 'recorrentes',
      priceCents: 38000, // R$ 380,00
      billingType: BillingType.recorrente,
      cycle: 'Ciclo de 3 meses',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-Fch6dWucTY4CviQh7q5y3gB9W8ddm0kwyyPkFtB3_oqeimHfHAIXWA49LAqqloYkemhDxVnLyp1RhDXzHmNIZpKDSm2c9GkjbsMFNFVOx59v5ZWR3FVjOoF_w-lrm6FTQOe1yeK_QhPIz5scomN1RPo01cdIwSbzz-txbKfyIPIoTt8Nx8Dxp3q04Q4sqELtJX_7NnF6Xx3FB__oLkrWOi5LU44gW-9hgItuzd-kxWuuiQ2E-5k',
      active: true,
    },
    {
      id: 'prod-3',
      accountId,
      title: 'E-book & Templates de Gestão',
      description:
        'Kit completo de planilhas financeiras com entrega automatizada por e-mail e webhook logo após compensação bancária.',
      category: 'digitais',
      priceCents: 9700, // R$ 97,00
      billingType: BillingType.avulsa,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDC90nO-8JsodPnijZkjoami8QYRPRdgWaySkoKvDd4MhCN2Nir0cPEGFE_FeFC-sLtKOZPQbAsztM6Zk1M7LEfgsHrDFTEaY4c6j_zFAWndjmAByFp8o8kgYD-0WPKTolBGgVTzYev0hyiX_-mX2Ht-P3m5QfCORRKOB1NiUb-RYV-WpkqtacFJRfbw_mJhNLBfmeV5PdLMAkl3VYOVyECB66oGsrFh_Mhrne1tIP7_cVDeBkd4iY',
      active: true,
    },
    {
      id: 'prod-4',
      accountId,
      title: 'Desenvolvimento Web & Landing Page',
      description:
        'Estruturação visual de alta conversão, código otimizado, integração com Pixel e gateway NextPay configurado.',
      category: 'servicos',
      priceCents: 320000, // R$ 3.200,00
      billingType: BillingType.avulsa,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBuyIQJXrgS104egwX6vtcxZk5Vl6cQU-I-F3VG8ln5qWr04iARdxvK0P-vJREauVxHmYHkjn1yn_wY2nmYoRs-reBccbmC4GjcS9ALVQxXBODFsJA6dQxnGk2JX2ss2Gdnk6e-0_QZspaf-QkY1FOQUk-sF9N9TKPAYtdJyvCZi8Tq-bxXR_rx2uMZ3nJ262wCYDOT_xLaO9eVAIsv7IyMKoVLWfJcHR79Udhk-nW8duK1BEigKFg',
      active: true,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 4. Links de Pagamento
  const linksData = [
    {
      id: 'link-1',
      accountId,
      productId: 'prod-2',
      title: 'Consultoria Design UX/UI Contínua',
      description: 'Suporte mensal a squads digitais e prototipação',
      amountCents: 150000, // R$ 1.500,00
      billingType: BillingType.recorrente,
      slug: 'consultoria-design-ux-ui',
      active: true,
      maxInstallments: 12,
      enablePix: true,
      enableCard: true,
      enableBoleto: true,
      views: 18,
      sales: 14,
    },
    {
      id: 'link-2',
      accountId,
      productId: 'prod-4',
      title: 'Redesign Landing Page Institucional',
      description: 'Entrega final com Figma e Handover',
      amountCents: 380000, // R$ 3.800,00
      billingType: BillingType.avulsa,
      slug: 'redesign-landing-page',
      active: true,
      maxInstallments: 12,
      enablePix: true,
      enableCard: true,
      enableBoleto: true,
      views: 4,
      sales: 3,
    },
    {
      id: 'link-3',
      accountId,
      productId: 'prod-1',
      title: 'Sessão Estratégica de Portfólio',
      description: 'Call de 90min com análise técnica e direcionamento',
      amountCents: 45000, // R$ 450,00
      billingType: BillingType.recorrente,
      slug: 'sessao-estrategica-portfolio',
      active: true,
      maxInstallments: 12,
      enablePix: true,
      enableCard: true,
      enableBoleto: true,
      views: 11,
      sales: 9,
    },
    {
      id: 'link-4',
      accountId,
      title: 'Identidade Visual Completa + Manual de Marca',
      description: 'Branding proprietário, guia de cores e tipografia',
      amountCents: 180000, // R$ 1.800,00
      billingType: BillingType.avulsa,
      slug: 'identidade-visual-completa',
      active: true,
      maxInstallments: 12,
      enablePix: true,
      enableCard: true,
      enableBoleto: true,
      views: 12,
      sales: 9,
    },
  ];

  for (const l of linksData) {
    await prisma.paymentLink.upsert({
      where: { id: l.id },
      update: l,
      create: l,
    });
  }

  // 5. Cobranças
  const now = new Date();
  const chargesData = [
    {
      id: 'tx-1',
      accountId,
      customerId: 'cli-1',
      paymentLinkId: 'link-4',
      description: 'Consultoria Brand Sprint',
      amountCents: 350000, // R$ 3.500,00
      feeCents: 3748,
      netCents: 346252,
      method: PaymentMethod.PIX,
      status: ChargeStatus.RECEIVED,
      dueDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Hoje
      paidAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'tx-2',
      accountId,
      customerId: 'cli-2',
      paymentLinkId: 'link-2',
      description: 'Redesign de Interface Web',
      amountCents: 420000, // R$ 4.200,00
      feeCents: 18956,
      netCents: 401044,
      method: PaymentMethod.CREDIT_CARD,
      status: ChargeStatus.CONFIRMED,
      dueDate: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'tx-3',
      accountId,
      customerId: 'cli-3',
      paymentLinkId: 'link-1',
      description: 'Manutenção Mensal Servidor',
      amountCents: 125000, // R$ 1.250,00
      feeCents: 1498,
      netCents: 123502,
      method: PaymentMethod.BOLETO,
      status: ChargeStatus.PENDING,
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'tx-4',
      accountId,
      customerId: 'cli-4',
      description: 'Desenvolvimento App Mobile',
      amountCents: 850000, // R$ 8.500,00
      feeCents: 42513,
      netCents: 807487,
      method: PaymentMethod.CREDIT_CARD,
      status: ChargeStatus.CONFIRMED,
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      paidAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'tx-5',
      accountId,
      customerId: 'cli-2',
      description: 'Mentoria Individual (Hora)',
      amountCents: 68000, // R$ 680,00
      feeCents: 928,
      netCents: 67072,
      method: PaymentMethod.BOLETO,
      status: ChargeStatus.OVERDUE,
      dueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const ch of chargesData) {
    await prisma.charge.upsert({
      where: { id: ch.id },
      update: ch,
      create: ch,
    });
  }

  // 6. Assinaturas
  const subscriptionsData = [
    {
      id: 'sub-1',
      accountId,
      customerId: 'cli-1',
      title: 'Mentoria & Acompanhamento Trimestral',
      priceCents: 38000,
      cycle: 'QUARTERLY',
      method: PaymentMethod.CREDIT_CARD,
      status: SubscriptionStatus.ACTIVE,
      nextBilling: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'sub-2',
      accountId,
      customerId: 'cli-2',
      title: 'Consultoria Design UX/UI Contínua',
      priceCents: 150000,
      cycle: 'MONTHLY',
      method: PaymentMethod.CREDIT_CARD,
      status: SubscriptionStatus.ACTIVE,
      nextBilling: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'sub-3',
      accountId,
      customerId: 'cli-3',
      title: 'Suporte & Manutenção Cloud / Servidor',
      priceCents: 85000,
      cycle: 'MONTHLY',
      method: PaymentMethod.BOLETO,
      status: SubscriptionStatus.ACTIVE,
      nextBilling: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const s of subscriptionsData) {
    await prisma.subscription.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  console.log('Seed do NextPay concluído com sucesso!');
}

seed()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
