INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
VALUES ('pickup', 'pickup', 'Store Pickup', 'Pick up your order at our physical store location', true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
