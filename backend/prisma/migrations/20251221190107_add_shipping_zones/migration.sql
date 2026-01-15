/*
  Warnings:

  - You are about to drop the column `price` on the `ShippingMethod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingMethodId" TEXT DEFAULT 'standard';

-- AlterTable
ALTER TABLE "ShippingMethod" DROP COLUMN "price",
ADD COLUMN     "isExpress" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ShippingZone" (
    "id" TEXT NOT NULL,
    "shippingMethodId" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingCity" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cityTown" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ShippingCity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingZone_shippingMethodId_idx" ON "ShippingZone"("shippingMethodId");

-- CreateIndex
CREATE INDEX "ShippingCity_zoneId_idx" ON "ShippingCity"("zoneId");

-- CreateIndex
CREATE INDEX "Product_shippingMethodId_idx" ON "Product"("shippingMethodId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingCity" ADD CONSTRAINT "ShippingCity_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
