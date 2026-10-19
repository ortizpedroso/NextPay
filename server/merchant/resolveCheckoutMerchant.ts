import { prisma } from '../db/prisma';
import { DEFAULT_MERCHANT_DB_ID, getDefaultMerchantDbId } from './merchantScope';

export async function resolveCheckoutMerchantDbId(input: {
  paymentLinkPublicId?: string | null;
  productPublicId?: string | null;
}): Promise<string> {
  try {
    if (input.paymentLinkPublicId) {
      const link = await prisma.paymentLink.findUnique({
        where: { linkPublicId: input.paymentLinkPublicId },
        select: { merchantId: true },
      });
      if (link?.merchantId) {
        return link.merchantId;
      }
    }

    if (input.productPublicId) {
      const product = await prisma.catalogProduct.findUnique({
        where: { productPublicId: input.productPublicId },
        select: { merchantId: true },
      });
      if (product?.merchantId) {
        return product.merchantId;
      }
    }

    return await getDefaultMerchantDbId();
  } catch {
    return DEFAULT_MERCHANT_DB_ID;
  }
}
