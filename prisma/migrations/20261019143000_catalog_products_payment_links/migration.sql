-- CreateTable
CREATE TABLE "CatalogProduct" (
    "id" TEXT NOT NULL,
    "productPublicId" VARCHAR(80) NOT NULL,
    "urlSlug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "badge" VARCHAR(64),
    "priceCents" INTEGER NOT NULL,
    "billingType" VARCHAR(16) NOT NULL,
    "recurrencyCycle" VARCHAR(64),
    "maxInstallments" INTEGER NOT NULL DEFAULT 12,
    "imageUrl" TEXT NOT NULL,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "linkPublicId" VARCHAR(80) NOT NULL,
    "urlSlug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subtitle" VARCHAR(500) NOT NULL,
    "billingType" VARCHAR(16) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    "amountCents" INTEGER NOT NULL,
    "totalBilledCents" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "productPublicId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProduct_productPublicId_key" ON "CatalogProduct"("productPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProduct_urlSlug_key" ON "CatalogProduct"("urlSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_linkPublicId_key" ON "PaymentLink"("linkPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_urlSlug_key" ON "PaymentLink"("urlSlug");

-- CreateIndex
CREATE INDEX "PaymentLink_productPublicId_idx" ON "PaymentLink"("productPublicId");
