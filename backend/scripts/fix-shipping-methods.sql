-- Check and insert shipping methods
-- Run this in Prisma Studio or your PostgreSQL client

-- Check current shipping methods
SELECT id, code, name, enabled, "isExpress" FROM "ShippingMethod";

-- Insert standard shipping method if it doesn't exist
INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
VALUES ('standard', 'standard', 'Standard Shipping', 'Regular delivery within 3-5 business days', true, false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  code = 'standard',
  name = 'Standard Shipping',
  description = 'Regular delivery within 3-5 business days',
  enabled = true,
  "isExpress" = false,
  "updatedAt" = NOW();

-- Insert express shipping method if it doesn't exist
INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
VALUES ('express', 'express', 'Express Shipping', 'Fast delivery within 1-2 business days', true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  code = 'express',
  name = 'Express Shipping',
  description = 'Fast delivery within 1-2 business days',
  enabled = true,
  "isExpress" = true,
  "updatedAt" = NOW();

-- Verify the inserts
SELECT id, code, name, enabled, "isExpress" FROM "ShippingMethod";
