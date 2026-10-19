import { Router } from 'express';

import { createCustomerInputSchema, gatewayEnvironmentSchema } from '../../gateway/dtos';
import type { PaymentGatewayResolver } from './payments.routes';
export type MerchantCustomerRecord = {
  neutralCustomerId: string;
  name: string;
  email: string;
  document: string;
};

export interface MerchantCustomerStore {
  list(): Promise<MerchantCustomerRecord[]>;
  save(record: MerchantCustomerRecord): Promise<void>;
}

export class InMemoryMerchantCustomerStore implements MerchantCustomerStore {
  private readonly rows: MerchantCustomerRecord[] = [];

  async list(): Promise<MerchantCustomerRecord[]> {
    return [...this.rows];
  }

  async save(record: MerchantCustomerRecord): Promise<void> {
    this.rows.unshift(record);
  }
}

export function createCustomersRouter(
  resolveGateway: PaymentGatewayResolver,
  customerStore: MerchantCustomerStore,
): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const rows = await customerStore.list();
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

      await customerStore.save({
        neutralCustomerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        document: customer.document,
      });

      res.status(201).json({ customer });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
