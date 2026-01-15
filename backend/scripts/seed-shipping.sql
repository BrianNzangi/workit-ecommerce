-- Insert Standard Shipping Method
INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
VALUES (
    'standard',
    'standard',
    'Standard Shipping',
    'Regular delivery within 3-5 business days',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;

-- Insert Express Shipping Method
INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
VALUES (
    'express',
    'express',
    'Express Shipping',
    'Fast delivery within 1-2 business days',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;
