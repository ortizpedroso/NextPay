-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "protocol" VARCHAR(80) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "pixKey" VARCHAR(180) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_protocol_key" ON "WithdrawalRequest"("protocol");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_merchantId_idx" ON "WithdrawalRequest"("merchantId");

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
