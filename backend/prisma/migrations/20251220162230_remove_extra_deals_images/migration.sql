/*
  Warnings:

  - You are about to drop the column `dealsImage2Id` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `dealsImage3Id` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `dealsImage4Id` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `dealsMobileImage2Id` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `dealsMobileImage3Id` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `dealsMobileImage4Id` on the `Banner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsImage2Id_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsImage3Id_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsImage4Id_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsMobileImage2Id_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsMobileImage3Id_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_dealsMobileImage4Id_fkey";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "dealsImage2Id",
DROP COLUMN "dealsImage3Id",
DROP COLUMN "dealsImage4Id",
DROP COLUMN "dealsMobileImage2Id",
DROP COLUMN "dealsMobileImage3Id",
DROP COLUMN "dealsMobileImage4Id";
