-- CreateTable
CREATE TABLE "PaymentIdMapping" (
    "id" TEXT NOT NULL,
    "neutralId" VARCHAR(80) NOT NULL,
    "externalId" VARCHAR(80) NOT NULL,
    "entityType" VARCHAR(16) NOT NULL,
    "environment" "GatewayEnvironment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentIdMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventFingerprint" VARCHAR(128) NOT NULL,
    "eventType" VARCHAR(64) NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdMapping_neutralId_key" ON "PaymentIdMapping"("neutralId");

-- CreateIndex
CREATE INDEX "PaymentIdMapping_externalId_environment_idx" ON "PaymentIdMapping"("externalId", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "InboundWebhookEvent_eventFingerprint_key" ON "InboundWebhookEvent"("eventFingerprint");
