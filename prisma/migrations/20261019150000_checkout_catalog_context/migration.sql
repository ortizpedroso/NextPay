-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN "paymentLinkPublicId" VARCHAR(80);
ALTER TABLE "CheckoutSession" ADD COLUMN "productPublicId" VARCHAR(80);

CREATE INDEX "CheckoutSession_paymentLinkPublicId_idx" ON "CheckoutSession"("paymentLinkPublicId");
CREATE INDEX "CheckoutSession_productPublicId_idx" ON "CheckoutSession"("productPublicId");
