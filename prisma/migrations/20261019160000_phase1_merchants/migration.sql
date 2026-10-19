-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "merchantPublicId" VARCHAR(80) NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantUser" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchantPublicId_key" ON "Merchant"("merchantPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantUser_email_key" ON "MerchantUser"("email");

-- CreateIndex
CREATE INDEX "MerchantUser_merchantId_idx" ON "MerchantUser"("merchantId");

-- AddForeignKey
ALTER TABLE "MerchantUser" ADD CONSTRAINT "MerchantUser_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Merchant" ("id", "merchantPublicId", "displayName", "createdAt", "updatedAt")
VALUES ('cmdefaultmerchant000000000001', 'np_merchant_default', 'Lojista Demo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "MerchantUser" ("id", "merchantId", "email", "createdAt")
VALUES ('cmdefaultmerchantuser00000001', 'cmdefaultmerchant000000000001', 'lojista@nextpay.test', CURRENT_TIMESTAMP);

ALTER TABLE "CatalogProduct" ADD COLUMN "merchantId" TEXT;
ALTER TABLE "PaymentLink" ADD COLUMN "merchantId" TEXT;
ALTER TABLE "MerchantCustomer" ADD COLUMN "merchantId" TEXT;
ALTER TABLE "LedgerTransaction" ADD COLUMN "merchantId" TEXT;
ALTER TABLE "CheckoutSession" ADD COLUMN "merchantId" TEXT;

UPDATE "CatalogProduct" SET "merchantId" = 'cmdefaultmerchant000000000001' WHERE "merchantId" IS NULL;
UPDATE "PaymentLink" SET "merchantId" = 'cmdefaultmerchant000000000001' WHERE "merchantId" IS NULL;
UPDATE "MerchantCustomer" SET "merchantId" = 'cmdefaultmerchant000000000001' WHERE "merchantId" IS NULL;
UPDATE "LedgerTransaction" SET "merchantId" = 'cmdefaultmerchant000000000001' WHERE "merchantId" IS NULL;
UPDATE "CheckoutSession" SET "merchantId" = 'cmdefaultmerchant000000000001' WHERE "merchantId" IS NULL;

ALTER TABLE "CatalogProduct" ALTER COLUMN "merchantId" SET NOT NULL;
ALTER TABLE "PaymentLink" ALTER COLUMN "merchantId" SET NOT NULL;
ALTER TABLE "MerchantCustomer" ALTER COLUMN "merchantId" SET NOT NULL;
ALTER TABLE "LedgerTransaction" ALTER COLUMN "merchantId" SET NOT NULL;
ALTER TABLE "CheckoutSession" ALTER COLUMN "merchantId" SET NOT NULL;

CREATE INDEX "CatalogProduct_merchantId_idx" ON "CatalogProduct"("merchantId");
CREATE INDEX "PaymentLink_merchantId_idx" ON "PaymentLink"("merchantId");
CREATE INDEX "MerchantCustomer_merchantId_idx" ON "MerchantCustomer"("merchantId");
CREATE INDEX "LedgerTransaction_merchantId_idx" ON "LedgerTransaction"("merchantId");
CREATE INDEX "CheckoutSession_merchantId_idx" ON "CheckoutSession"("merchantId");

ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MerchantCustomer" ADD CONSTRAINT "MerchantCustomer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
