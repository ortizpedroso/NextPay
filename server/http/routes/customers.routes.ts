import { Router } from 'express';

import { createCustomerInputSchema, gatewayEnvironmentSchema } from '../../gateway/dtos';
import type { DashboardRequest } from '../../merchant/merchantScope';
import {
  resolveMerchantDbIdForRead,
  resolveMerchantDbIdForWrite,
} from '../../merchant/merchantScope';
import type { PaymentGatewayResolver } from './payments.routes';
export type MerchantCustomerRecord = {
  neutralCustomerId: string;
  name: string;
  email: string;
  document: string;
};

export interface MerchantCustomerStore {
  list(merchantDbId?: string): Promise<MerchantCustomerRecord[]>;
  save(record: MerchantCustomerRecord, merchantDbId: string): Promise<void>;
}

export class InMemoryMerchantCustomerStore implements MerchantCustomerStore {
  private readonly rows: MerchantCustomerRecord[] = [];

  private readonly merchantByCustomer = new Map<string, string>();

  async list(merchantDbId?: string): Promise<MerchantCustomerRecord[]> {
    return this.rows.filter((row) => {
      if (!merchantDbId) {
        return true;
      }
      const scoped = this.merchantByCustomer.get(row.neutralCustomerId);
      return !scoped || scoped === merchantDbId;
    });
  }

  async save(record: MerchantCustomerRecord, merchantDbId: string): Promise<void> {
    this.rows.unshift(record);
    this.merchantByCustomer.set(record.neutralCustomerId, merchantDbId);
  }
}

export function createCustomersRouter(
  resolveGateway: PaymentGatewayResolver,
  customerStore: MerchantCustomerStore,
): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const rows = await customerStore.list(merchantDbId);
      res.json({ customers: rows });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = createCustomerInputSchema
        .extend({ environment: gatewayEnvironmentSchema.default('SANDBOX') })
        .parse(req.body);

      const { environment, ...customerInput } = body;
      const gateway = await resolveGateway(environment);
      const customer = await gateway.createCustomer(customerInput);

      const merchantDbId = await resolveMerchantDbIdForWrite(req as DashboardRequest);
      await customerStore.save(
        {
          neutralCustomerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          document: customer.document,
        },
        merchantDbId,
      );

      res.status(201).json({ customer });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
