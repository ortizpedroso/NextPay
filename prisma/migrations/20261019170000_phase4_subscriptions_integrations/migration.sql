-- AlterTable
ALTER TABLE "OutboundWebhookDelivery" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "subscriptionPublicId" VARCHAR(80) NOT NULL,
    "productPublicId" VARCHAR(80),
    "planTitle" VARCHAR(200) NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "cadenceLabel" VARCHAR(128) NOT NULL,
    "customerName" VARCHAR(140) NOT NULL,
    "customerEmail" VARCHAR(180) NOT NULL,
    "paymentMethod" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    "nextBillingAt" TIMESTAMP(3) NOT NULL,
    "totalPaidCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionCycle" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "cyclePublicId" VARCHAR(80) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "neutralPaymentId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantApiKey" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "keyPublicId" VARCHAR(80) NOT NULL,
    "prefixHint" VARCHAR(24) NOT NULL,
    "suffixHint" VARCHAR(8) NOT NULL,
    "keyHash" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "MerchantApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantIntegration" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'DISCONNECTED',
    "connectedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionPublicId_key" ON "Subscription"("subscriptionPublicId");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_idx" ON "Subscription"("merchantId");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_status_idx" ON "Subscription"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCycle_cyclePublicId_key" ON "SubscriptionCycle"("cyclePublicId");

-- CreateIndex
CREATE INDEX "SubscriptionCycle_subscriptionId_idx" ON "SubscriptionCycle"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionCycle_dueAt_status_idx" ON "SubscriptionCycle"("dueAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantApiKey_keyPublicId_key" ON "MerchantApiKey"("keyPublicId");

-- CreateIndex
CREATE INDEX "MerchantApiKey_merchantId_idx" ON "MerchantApiKey"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantIntegration_merchantId_idx" ON "MerchantIntegration"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantIntegration_merchantId_platform_key" ON "MerchantIntegration"("merchantId", "platform");

-- CreateIndex
CREATE INDEX "OutboundWebhookDelivery_status_nextRetryAt_idx" ON "OutboundWebhookDelivery"("status", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCycle" ADD CONSTRAINT "SubscriptionCycle_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantApiKey" ADD CONSTRAINT "MerchantApiKey_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantIntegration" ADD CONSTRAINT "MerchantIntegration_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
