/*
  Warnings:

  - You are about to drop the column `originalPrice` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "originalPrice" INTEGER,
ADD COLUMN     "salePrice" INTEGER;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "originalPrice";
