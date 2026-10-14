import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../server/db.js';
import { DEMO_ACCOUNT_ID } from '../server/lib/auth.js';

describe('NextPay REST API Integration Tests', () => {
  beforeAll(async () => {
    // Garantir que a conta de demonstração existe
    await prisma.account.upsert({
      where: { id: DEMO_ACCOUNT_ID },
      update: {
        name: 'NextPay Test Account',
        email: 'test@nextpay.com.br',
        cpfCnpj: '12.345.678/0001-90',
        balanceCents: 100000,
      },
      create: {
        id: DEMO_ACCOUNT_ID,
        name: 'NextPay Test Account',
        email: 'test@nextpay.com.br',
        cpfCnpj: '12.345.678/0001-90',
        balanceCents: 100000,
      },
    });
  });

  beforeEach(async () => {
    // Limpeza de tabelas entre testes para isolamento
    await prisma.charge.deleteMany({ where: { accountId: DEMO_ACCOUNT_ID } });
    await prisma.paymentLink.deleteMany({ where: { accountId: DEMO_ACCOUNT_ID } });
    await prisma.product.deleteMany({ where: { accountId: DEMO_ACCOUNT_ID } });
    await prisma.customer.deleteMany({ where: { accountId: DEMO_ACCOUNT_ID } });
  });

  describe('GET /api/health', () => {
    it('deve retornar status 200 com ok=true e db=true', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, db: true });
    });
  });

  describe('GET /api/account', () => {
    it('deve retornar os detalhes da conta atual', async () => {
      const res = await request(app).get('/api/account');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(DEMO_ACCOUNT_ID);
      expect(res.body.name).toBe('NextPay Test Account');
      expect(res.body.balanceCents).toBe(100000);
    });
  });

  describe('CRUD /api/products', () => {
    it('deve criar, listar, atualizar e excluir um produto com validação Zod', async () => {
      // 1. Criar com dados válidos
      const createRes = await request(app).post('/api/products').send({
        title: 'Consultoria Especializada',
        description: 'Sessão técnica de 60 minutos',
        category: 'servicos',
        priceCents: 25000,
        billingType: 'avulsa',
      });
      expect(createRes.status).toBe(201);
      expect(createRes.body.title).toBe('Consultoria Especializada');
      expect(createRes.body.priceCents).toBe(25000);
      const prodId = createRes.body.id;

      // 2. Validação: Título curto demais deve falhar com 400
      const invalidRes = await request(app).post('/api/products').send({
        title: 'A',
        priceCents: 100,
      });
      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error).toBe('Dados inválidos');

      // 3. Listar produtos
      const listRes = await request(app).get('/api/products?page=1&pageSize=10');
      expect(listRes.status).toBe(200);
      expect(listRes.body.total).toBe(1);
      expect(listRes.body.items[0].id).toBe(prodId);

      // 4. Buscar por ID
      const getRes = await request(app).get(`/api/products/${prodId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.title).toBe('Consultoria Especializada');

      // 5. Atualizar
      const updateRes = await request(app)
        .put(`/api/products/${prodId}`)
        .send({ priceCents: 30000 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.priceCents).toBe(30000);

      // 6. Excluir
      const deleteRes = await request(app).delete(`/api/products/${prodId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.ok).toBe(true);

      // 7. Confirmar 404 após exclusão
      const notFoundRes = await request(app).get(`/api/products/${prodId}`);
      expect(notFoundRes.status).toBe(404);
    });
  });

  describe('CRUD /api/customers', () => {
    it('deve criar, listar, atualizar e excluir um cliente', async () => {
      // 1. Criar cliente
      const createRes = await request(app).post('/api/customers').send({
        name: 'João Silva',
        cpfCnpj: '123.456.789-00',
        email: 'joao.silva@exemplo.com.br',
        phone: '(11) 98765-4321',
        city: 'São Paulo',
        state: 'SP',
      });
      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('João Silva');
      const custId = createRes.body.id;

      // 2. Listar clientes
      const listRes = await request(app).get('/api/customers?q=João');
      expect(listRes.status).toBe(200);
      expect(listRes.body.total).toBe(1);
      expect(listRes.body.items[0].name).toBe('João Silva');

      // 3. Atualizar cliente
      const updateRes = await request(app)
        .put(`/api/customers/${custId}`)
        .send({ name: 'João Silva Júnior' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.name).toBe('João Silva Júnior');

      // 4. Excluir cliente
      const deleteRes = await request(app).delete(`/api/customers/${custId}`);
      expect(deleteRes.status).toBe(200);
    });
  });

  describe('CRUD /api/payment-links', () => {
    it('deve criar, alternar status ativo e listar links de pagamento', async () => {
      // 1. Criar link
      const createRes = await request(app).post('/api/payment-links').send({
        title: 'Link Teste de Pagamento',
        description: 'Acesso ao treinamento VIP',
        amountCents: 49900,
        billingType: 'avulsa',
        enablePix: true,
        enableCard: true,
        enableBoleto: false,
      });
      expect(createRes.status).toBe(201);
      expect(createRes.body.title).toBe('Link Teste de Pagamento');
      expect(createRes.body.active).toBe(true);
      const linkId = createRes.body.id;

      // 2. Alternar status (toggle)
      const toggleRes = await request(app).patch(`/api/payment-links/${linkId}/toggle`);
      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.active).toBe(false);

      // 3. Listar links
      const listRes = await request(app).get('/api/payment-links');
      expect(listRes.status).toBe(200);
      expect(listRes.body.total).toBe(1);
      expect(listRes.body.items[0].active).toBe(false);

      // 4. Excluir link
      const delRes = await request(app).delete(`/api/payment-links/${linkId}`);
      expect(delRes.status).toBe(200);
    });
  });

  describe('POST e GET /api/charges', () => {
    it('deve criar uma cobrança pendente e listá-la', async () => {
      const createRes = await request(app)
        .post('/api/charges')
        .send({
          description: 'Cobrança Avulsa via Pix',
          amountCents: 15000,
          method: 'PIX',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });
      expect(createRes.status).toBe(201);
      expect(createRes.body.status).toBe('PENDING');
      expect(createRes.body.amountCents).toBe(15000);
      expect(createRes.body.feeCents).toBeGreaterThan(0);
      expect(createRes.body.netCents).toBeLessThan(15000);

      const listRes = await request(app).get('/api/charges');
      expect(listRes.status).toBe(200);
      expect(listRes.body.total).toBe(1);
      expect(listRes.body.items[0].description).toBe('Cobrança Avulsa via Pix');
    });
  });

  describe('GET /api/dashboard', () => {
    it('deve retornar métricas e séries para o período selecionado', async () => {
      // Inserir cobrança recebida para teste de KPI
      await prisma.charge.create({
        data: {
          accountId: DEMO_ACCOUNT_ID,
          description: 'Teste Liquidado',
          amountCents: 10000,
          feeCents: 300,
          netCents: 9700,
          method: 'PIX',
          status: 'RECEIVED',
          dueDate: new Date(),
          paidAt: new Date(),
        },
      });

      const res = await request(app).get('/api/dashboard?days=30');
      expect(res.status).toBe(200);
      expect(res.body.kpis.days).toBe(30);
      expect(res.body.kpis.receivedCents).toBe(10000);
      expect(res.body.kpis.countReceived).toBe(1);
      expect(Array.isArray(res.body.chartData)).toBe(true);
      expect(res.body.chartData.length).toBe(30);
    });
  });
});
