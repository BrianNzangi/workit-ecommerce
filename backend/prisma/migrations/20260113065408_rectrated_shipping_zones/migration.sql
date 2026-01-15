-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'REFURBISHED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "items" JSONB NOT NULL,
    "total_value" DECIMAL(10,2) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_abandoned" BOOLEAN NOT NULL DEFAULT false,
    "is_converted" BOOLEAN NOT NULL DEFAULT false,
    "abandoned_at" TIMESTAMP(3),

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_session_id_key" ON "abandoned_carts"("session_id");

-- CreateIndex
CREATE INDEX "abandoned_carts_session_id_idx" ON "abandoned_carts"("session_id");

-- CreateIndex
CREATE INDEX "abandoned_carts_last_updated_idx" ON "abandoned_carts"("last_updated");

-- CreateIndex
CREATE INDEX "abandoned_carts_is_abandoned_idx" ON "abandoned_carts"("is_abandoned");

-- CreateIndex
CREATE INDEX "Product_condition_idx" ON "Product"("condition");
