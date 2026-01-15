-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "dealsImage2Id" TEXT,
ADD COLUMN     "dealsImage3Id" TEXT,
ADD COLUMN     "dealsMobileImage2Id" TEXT,
ADD COLUMN     "dealsMobileImage3Id" TEXT;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsImage2Id_fkey" FOREIGN KEY ("dealsImage2Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsImage3Id_fkey" FOREIGN KEY ("dealsImage3Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsMobileImage2Id_fkey" FOREIGN KEY ("dealsMobileImage2Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsMobileImage3Id_fkey" FOREIGN KEY ("dealsMobileImage3Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
