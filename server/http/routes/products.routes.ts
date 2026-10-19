import { Router } from 'express';
import { z } from 'zod';

import { buildCheckoutUrl, newProductPublicId, slugifyTitle } from '../../catalog/catalogIds';

const productCategorySchema = z.enum(['servicos', 'digitais', 'recorrentes', 'projetos']);
const billingTypeSchema = z.enum(['avulsa', 'recorrente']);

export type CatalogProductRecord = {
  productPublicId: string;
  urlSlug: string;
  title: string;
  description: string;
  category: z.infer<typeof productCategorySchema>;
  badge?: string | null;
  priceCents: number;
  billingType: z.infer<typeof billingTypeSchema>;
  recurrencyCycle?: string | null;
  maxInstallments: number;
  imageUrl: string;
  salesCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  checkoutUrl: string;
};

export interface CatalogProductStore {
  list(includeArchived?: boolean): Promise<CatalogProductRecord[]>;
  getByPublicId(productPublicId: string): Promise<CatalogProductRecord | null>;
  getBySlugOrPublicId(slugOrId: string): Promise<CatalogProductRecord | null>;
  incrementSales(productPublicId: string): Promise<void>;
  create(
    input: Omit<
      CatalogProductRecord,
      'productPublicId' | 'checkoutUrl' | 'salesCount' | 'status'
    > & {
      productPublicId: string;
      urlSlug: string;
    },
  ): Promise<CatalogProductRecord>;
  update(
    productPublicId: string,
    patch: Partial<
      Pick<
        CatalogProductRecord,
        | 'title'
        | 'description'
        | 'category'
        | 'badge'
        | 'priceCents'
        | 'billingType'
        | 'recurrencyCycle'
        | 'maxInstallments'
        | 'imageUrl'
        | 'status'
        | 'urlSlug'
      >
    >,
  ): Promise<CatalogProductRecord | null>;
}

export class InMemoryCatalogProductStore implements CatalogProductStore {
  private readonly rows = new Map<string, CatalogProductRecord>();

  async list(includeArchived = false): Promise<CatalogProductRecord[]> {
    return [...this.rows.values()].filter((row) => includeArchived || row.status === 'ACTIVE');
  }

  async getByPublicId(productPublicId: string): Promise<CatalogProductRecord | null> {
    return this.rows.get(productPublicId) ?? null;
  }

  async getBySlugOrPublicId(slugOrId: string): Promise<CatalogProductRecord | null> {
    const byId = this.rows.get(slugOrId);
    if (byId) {
      return byId;
    }
    for (const row of this.rows.values()) {
      if (row.urlSlug === slugOrId) {
        return row;
      }
    }
    return null;
  }

  async incrementSales(productPublicId: string): Promise<void> {
    const row = this.rows.get(productPublicId);
    if (row) {
      row.salesCount += 1;
    }
  }

  async create(
    input: Omit<CatalogProductRecord, 'checkoutUrl' | 'salesCount' | 'status'> & {
      productPublicId: string;
      urlSlug: string;
    },
  ): Promise<CatalogProductRecord> {
    const record: CatalogProductRecord = {
      ...input,
      salesCount: 0,
      status: 'ACTIVE',
      checkoutUrl: buildCheckoutUrl(input.urlSlug),
    };
    this.rows.set(record.productPublicId, record);
    return record;
  }

  async update(
    productPublicId: string,
    patch: Partial<
      Pick<
        CatalogProductRecord,
        | 'title'
        | 'description'
        | 'category'
        | 'badge'
        | 'priceCents'
        | 'billingType'
        | 'recurrencyCycle'
        | 'maxInstallments'
        | 'imageUrl'
        | 'status'
        | 'urlSlug'
      >
    >,
  ): Promise<CatalogProductRecord | null> {
    const existing = this.rows.get(productPublicId);
    if (!existing) {
      return null;
    }
    const urlSlug = patch.urlSlug ?? existing.urlSlug;
    const updated: CatalogProductRecord = {
      ...existing,
      ...patch,
      urlSlug,
      checkoutUrl: buildCheckoutUrl(urlSlug),
    };
    this.rows.set(productPublicId, updated);
    return updated;
  }
}

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  category: productCategorySchema.default('servicos'),
  badge: z.string().max(64).optional(),
  priceCents: z.number().int().positive(),
  billingType: billingTypeSchema.default('avulsa'),
  recurrencyCycle: z.string().max(64).optional(),
  maxInstallments: z.number().int().min(1).max(21).default(12),
  imageUrl: z.string().url().max(2000).optional(),
  urlSlug: z.string().min(2).max(120).optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

const DEFAULT_PRODUCT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M';

export function createProductsRouter(productStore: CatalogProductStore): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const products = await productStore.list(includeArchived);
      res.json({ products });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:productPublicId', async (req, res, next) => {
    try {
      const product = await productStore.getByPublicId(req.params.productPublicId);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ product });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = createProductSchema.parse(req.body);
      const productPublicId = newProductPublicId();
      let urlSlug = body.urlSlug ?? slugifyTitle(body.title);
      urlSlug = `${urlSlug}-${productPublicId.slice(-6)}`;

      const product = await productStore.create({
        productPublicId,
        urlSlug,
        title: body.title.trim(),
        description:
          body.description?.trim() || 'Descrição dos entregáveis e benefícios inclusos no pacote.',
        category: body.category,
        badge: body.badge ?? null,
        priceCents: body.priceCents,
        billingType: body.billingType,
        recurrencyCycle: body.recurrencyCycle ?? null,
        maxInstallments: body.maxInstallments,
        imageUrl: body.imageUrl ?? DEFAULT_PRODUCT_IMAGE,
      });

      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:productPublicId', async (req, res, next) => {
    try {
      const body = updateProductSchema.parse(req.body);
      const patch: Parameters<CatalogProductStore['update']>[1] = { ...body };
      if (body.title && !body.urlSlug) {
        patch.urlSlug = slugifyTitle(body.title);
      }
      const product = await productStore.update(req.params.productPublicId, patch);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ product });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
