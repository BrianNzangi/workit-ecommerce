-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "dealsImage4Id" TEXT,
ADD COLUMN     "dealsMobileImage4Id" TEXT;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsImage4Id_fkey" FOREIGN KEY ("dealsImage4Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_dealsMobileImage4Id_fkey" FOREIGN KEY ("dealsMobileImage4Id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
