-- Seed default shipping method
INSERT INTO "ShippingMethod" ("id", "code", "name", "description", "enabled", "isExpress", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'standard-shipping',
  'Standard Shipping',
  'Regular delivery service',
  true,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;
