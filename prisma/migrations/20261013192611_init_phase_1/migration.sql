-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('avulsa', 'recorrente');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'BOLETO', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "phone" TEXT,
    "bankCode" TEXT,
    "bankName" TEXT,
    "agency" TEXT,
    "account" TEXT,
    "accountType" TEXT,
    "pixKey" TEXT,
    "asaasWalletId" TEXT,
    "asaasApiKey" TEXT,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'servicos',
    "priceCents" INTEGER NOT NULL,
    "billingType" "BillingType" NOT NULL DEFAULT 'avulsa',
    "cycle" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "productId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amountCents" INTEGER NOT NULL,
    "billingType" "BillingType" NOT NULL DEFAULT 'avulsa',
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "maxInstallments" INTEGER NOT NULL DEFAULT 12,
    "enablePix" BOOLEAN NOT NULL DEFAULT true,
    "enableCard" BOOLEAN NOT NULL DEFAULT true,
    "enableBoleto" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT,
    "paymentLinkId" TEXT,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "netCents" INTEGER NOT NULL DEFAULT 0,
    "method" "PaymentMethod" NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "asaasId" TEXT,
    "pixQrCode" TEXT,
    "pixCopyPaste" TEXT,
    "boletoBarcode" TEXT,
    "boletoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT,
    "title" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "method" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextBilling" TIMESTAMP(3),
    "asaasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "destinationBank" TEXT,
    "destinationAgency" TEXT,
    "destinationAccount" TEXT,
    "destinationPixKey" TEXT,
    "asaasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Customer_accountId_idx" ON "Customer"("accountId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_cpfCnpj_idx" ON "Customer"("cpfCnpj");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Product_accountId_idx" ON "Product"("accountId");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "PaymentLink_accountId_idx" ON "PaymentLink"("accountId");

-- CreateIndex
CREATE INDEX "PaymentLink_slug_idx" ON "PaymentLink"("slug");

-- CreateIndex
CREATE INDEX "PaymentLink_active_idx" ON "PaymentLink"("active");

-- CreateIndex
CREATE INDEX "PaymentLink_title_idx" ON "PaymentLink"("title");

-- CreateIndex
CREATE INDEX "Charge_accountId_idx" ON "Charge"("accountId");

-- CreateIndex
CREATE INDEX "Charge_customerId_idx" ON "Charge"("customerId");

-- CreateIndex
CREATE INDEX "Charge_status_idx" ON "Charge"("status");

-- CreateIndex
CREATE INDEX "Charge_method_idx" ON "Charge"("method");

-- CreateIndex
CREATE INDEX "Charge_dueDate_idx" ON "Charge"("dueDate");

-- CreateIndex
CREATE INDEX "Charge_createdAt_idx" ON "Charge"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_accountId_idx" ON "Subscription"("accountId");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_accountId_idx" ON "Withdrawal"("accountId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_accountId_idx" ON "WebhookEvent"("accountId");

-- CreateIndex
CREATE INDEX "WebhookEvent_event_idx" ON "WebhookEvent"("event");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
