-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "sessionPublicId" VARCHAR(64) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "method" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "paymentId" VARCHAR(80),
    "pixCopyPaste" TEXT,
    "customerName" VARCHAR(140) NOT NULL,
    "customerEmail" VARCHAR(180) NOT NULL,
    "customerDocument" VARCHAR(18) NOT NULL,
    "environment" "GatewayEnvironment" NOT NULL DEFAULT 'SANDBOX',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCustomer" (
    "id" TEXT NOT NULL,
    "neutralCustomerId" VARCHAR(80) NOT NULL,
    "name" VARCHAR(140) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "document" VARCHAR(18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "neutralPaymentId" VARCHAR(80) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "netAmountCents" INTEGER,
    "status" VARCHAR(32) NOT NULL,
    "method" VARCHAR(32) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "customerName" VARCHAR(140),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundWebhookDelivery" (
    "id" TEXT NOT NULL,
    "targetUrl" VARCHAR(500) NOT NULL,
    "eventType" VARCHAR(64) NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboundWebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_sessionPublicId_key" ON "CheckoutSession"("sessionPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantCustomer_neutralCustomerId_key" ON "MerchantCustomer"("neutralCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerTransaction_neutralPaymentId_key" ON "LedgerTransaction"("neutralPaymentId");
