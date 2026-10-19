-- CreateEnum
CREATE TYPE "GatewayEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateTable
CREATE TABLE "ProcessorCredentialVault" (
    "id" TEXT NOT NULL,
    "environment" "GatewayEnvironment" NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "prefixHint" VARCHAR(32) NOT NULL,
    "suffixHint" VARCHAR(8) NOT NULL,
    "rotationVersion" INTEGER NOT NULL DEFAULT 1,
    "lastValidatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessorCredentialVault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIdempotencyKey" (
    "id" TEXT NOT NULL,
    "idempotencyKey" VARCHAR(128) NOT NULL,
    "operation" VARCHAR(64) NOT NULL,
    "requestHash" VARCHAR(128) NOT NULL,
    "responseJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessorCredentialVault_environment_key" ON "ProcessorCredentialVault"("environment");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdempotencyKey_idempotencyKey_key" ON "PaymentIdempotencyKey"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentIdempotencyKey_expiresAt_idx" ON "PaymentIdempotencyKey"("expiresAt");
