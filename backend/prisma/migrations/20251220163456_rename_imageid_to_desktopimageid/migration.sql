/*
  Warnings:

  - You are about to drop the column `imageId` on the `Banner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_imageId_fkey";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "imageId",
ADD COLUMN     "desktopImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_desktopImageId_fkey" FOREIGN KEY ("desktopImageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
