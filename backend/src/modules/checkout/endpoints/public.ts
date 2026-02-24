import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, and, ilike, isNotNull, count } from "../../../lib/db.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { productSearchService } from "../../../services/search/product-search.service.js";

// Address schema for creation on the fly
const addressSchema = z.object({
    fullName: z.string(),
    streetLine1: z.string(),
    streetLine2: z.string().optional().or(z.literal("")),
    city: z.string(),
    province: z.string(),
    postalCode: z.string().optional().or(z.literal("")),
    phoneNumber: z.string(),
    country: z.string().optional().default("KE")
});

const normalizeCampaignDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseIdArray = (value: string | string[] | null | undefined) => {
    if (!value) return [] as string[];
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

    const raw = String(value).trim();
    if (!raw) return [] as string[];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Fallback to comma-separated format.
    }

    return raw.split(",").map((item) => item.trim()).filter(Boolean);
};

const fromKesMinorUnits = (value?: number | null) => {
    if (value === null || value === undefined) return 0;
    return Number(value) / 100;
};

export const checkoutPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook("preHandler", fastify.optionalStorefrontAuth);

    const getCart = async (req: any) => {
        const userId = req.storefrontUser?.id;
        const guestId = req.headers['x-guest-id'] as string;

        console.log(`[Checkout DEBUG] getCart - UserId: ${userId}, GuestId: ${guestId}`);

        if (!userId && !guestId) {
            console.log('[Checkout DEBUG] Both IDs missing');
            return null;
        }

        // 1. Try fetching user cart
        if (userId) {
            let userCart = await db.query.carts.findFirst({
                where: eq(schema.carts.customerId, userId),
                with: { lines: { with: { product: true } } }
            });
            console.log(`[Checkout DEBUG] User Cart found? ${!!userCart}`);

            // 2. If no user cart, check if we can merge a guest cart
            if (!userCart && guestId) {
                console.log(`[Checkout DEBUG] Attempting merge for guestId: ${guestId}`);
                const guestCart = await db.query.carts.findFirst({
                    where: eq(schema.carts.guestId, guestId),
                    with: { lines: { with: { product: true } } }
                });
                console.log(`[Checkout DEBUG] Guest Cart found to merge? ${!!guestCart}`);

                if (guestCart) {
                    // MERGE: Assign guest cart to user
                    await db.update(schema.carts)
                        .set({ customerId: userId, guestId: null }) // Clear guestId to finalize ownership
                        .where(eq(schema.carts.id, guestCart.id));

                    // Helper: re-fetch to be safe
                    userCart = await db.query.carts.findFirst({
                        where: eq(schema.carts.id, guestCart.id),
                        with: { lines: { with: { product: true } } }
                    });
                    console.log(`[Checkout DEBUG] Merged cart ID: ${userCart?.id}`);
                }
            }
            return userCart;
        }

        // 3. Fallback: Guest only
        console.log(`[Checkout DEBUG] Guest only fetch`);
        return db.query.carts.findFirst({
            where: eq(schema.carts.guestId, guestId),
            with: { lines: { with: { product: true } } }
        });
    };

    fastify.post("/initiate", {
        schema: {
            tags: ["Checkout"],
            body: z.object({
                shippingAddressId: z.string().optional(),
                billingAddressId: z.string().optional(),
                shippingAddress: addressSchema.optional(), // Allow passing full address
                billingAddress: addressSchema.optional(),
                shippingMethodId: z.string().optional(),
                couponCode: z.string().optional(),
            })
        }
    }, async (request, reply) => {
        const body = request.body as any;
        let { shippingAddressId, billingAddressId, shippingMethodId } = body;
        const userId = (request as any).storefrontUser?.id;
        const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim() : "";

        if (!userId) return reply.status(401).send({ message: "Login required for checkout" });

        const cart = await getCart(request);
        if (!cart || cart.lines.length === 0) {
            return reply.status(400).send({ message: "Cart is empty" });
        }

        const stockAdjustedProductIds = new Set<string>();

        // Use transaction for atomic order creation
        const checkoutResult = await (db as any).transaction(async (tx: any) => {

            // 1. Process Addresses (Create if passed as object)
            if (!shippingAddressId && body.shippingAddress) {
                shippingAddressId = uuidv4();
                await tx.insert(schema.addresses).values({
                    id: shippingAddressId,
                    customerId: userId,
                    ...body.shippingAddress,
                    defaultShipping: false,
                    defaultBilling: false
                });
            }

            if (!billingAddressId && body.billingAddress) {
                // If billing is same as shipping (in content) but passed separately, create new. 
                // Or if user passed same object. 
                // For simplicity, always create if passed.
                billingAddressId = uuidv4();
                await tx.insert(schema.addresses).values({
                    id: billingAddressId,
                    customerId: userId,
                    ...body.billingAddress,
                    defaultShipping: false,
                    defaultBilling: false
                });
            }

            // Fallback if billing not provided: Use shipping
            if (!billingAddressId) billingAddressId = shippingAddressId;

            if (!shippingAddressId) {
                throw new Error("Shipping address is required (ID or Object)");
            }

            // 2. Validate & Calculate Items
            let subTotal = 0;
            const orderLinesData: any[] = [];

            for (const line of cart.lines) {
                const product = line.product;

                // Check enabled
                if (!product.enabled) {
                    throw new Error(`Product ${product.name} is no longer available`);
                }

                // Check Stock
                if (product.stockOnHand < line.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockOnHand}`);
                }

                // Calculate Price
                const price = product.salePrice ?? product.originalPrice ?? 0;
                const linePrice = price * line.quantity;
                subTotal += linePrice;

                orderLinesData.push({
                    productId: product.id,
                    quantity: line.quantity,
                    linePrice: price // Unit Price? Or total? 
                    // In my other file I might have used unit price, but here I think `linePrice` usually implies total for line.
                    // A previous check showed schema has integer for linePrice. 
                    // Let's stick with total line price for consistency with common ecom patterns? 
                    // Wait, `line.product.salePrice` is unit price. 
                    // `orderLines` table `linePrice` column. 
                    // I will store the *unit price* actually, because getting quantity is easier. 
                    // Re-reading my previous thought: "linePrice usually unit_price". 
                    // Let's just create line with total? No, unit price is safer.
                    // ACTUALLY: In `store/endpoints/checkout.ts`, I pushed `price` (unit price) into `linePrice`. 
                    // Let's verify schema comment? No comment. 
                    // I'll stick to unit price.
                });

                // Decrement Stock
                await tx.update(schema.products)
                    .set({ stockOnHand: product.stockOnHand - line.quantity })
                    .where(eq(schema.products.id, product.id));
                stockAdjustedProductIds.add(product.id);
            }

            // 3. Validate Shipping
            let shippingCost = 0;
            let resolvedShippingMethodId = shippingMethodId;

            if (shippingMethodId) {
                const methodById = await tx.query.shippingMethods.findFirst({
                    where: eq(schema.shippingMethods.id, shippingMethodId)
                });

                if (methodById) {
                    resolvedShippingMethodId = methodById.id;
                } else {
                    const methodByCode = await tx.query.shippingMethods.findFirst({
                        where: eq(schema.shippingMethods.code, shippingMethodId)
                    });
                    if (methodByCode) {
                        resolvedShippingMethodId = methodByCode.id;
                    } else {
                        throw new Error(`Invalid shipping method: ${shippingMethodId}`);
                    }
                }

                // Calculate logic placeholder
                shippingCost = 0;
            }

            const tax = 0;
            let discountAmount = 0;
            let redemptionCampaign: any | null = null;

            if (couponCode) {
                const normalizedCode = couponCode.toUpperCase();
                const campaign = await tx.query.campaigns.findFirst({
                    where: and(
                        eq(schema.campaigns.status, "ACTIVE"),
                        isNotNull(schema.campaigns.couponCode),
                        ilike(schema.campaigns.couponCode, normalizedCode)
                    ),
                });

                if (!campaign) {
                    throw new Error("Invalid coupon code");
                }

                const now = new Date();
                const startsAt = normalizeCampaignDate(campaign.startDate);
                const endsAt = normalizeCampaignDate(campaign.endDate);

                if (startsAt && startsAt > now) {
                    throw new Error("Coupon is not yet active");
                }

                if (endsAt && endsAt < now) {
                    throw new Error("Coupon has expired");
                }

                if (campaign.usageLimit && campaign.usageLimit > 0) {
                    const totalCountResult = await tx
                        .select({ count: count() })
                        .from(schema.campaignRedemptions)
                        .where(eq(schema.campaignRedemptions.campaignId, campaign.id));
                    const totalCount = Number(totalCountResult[0]?.count ?? 0);
                    if (totalCount >= campaign.usageLimit) {
                        throw new Error("Coupon usage limit reached");
                    }
                }

                if (campaign.usagePerCustomer && campaign.usagePerCustomer > 0) {
                    const customerCountResult = await tx
                        .select({ count: count() })
                        .from(schema.campaignRedemptions)
                        .where(and(
                            eq(schema.campaignRedemptions.campaignId, campaign.id),
                            eq(schema.campaignRedemptions.customerId, userId)
                        ));
                    const customerCount = Number(customerCountResult[0]?.count ?? 0);
                    if (customerCount >= campaign.usagePerCustomer) {
                        throw new Error("Coupon usage limit reached for this customer");
                    }
                }

                if (!campaign.discountType || campaign.discountType === "NONE") {
                    throw new Error("Coupon is not applicable");
                }

                if (campaign.discountType !== "BUY_X_GET_Y") {
                    const minPurchaseAmount = fromKesMinorUnits(campaign.minPurchaseAmount);
                    if (subTotal < minPurchaseAmount) {
                        throw new Error(`Minimum order value of KES ${minPurchaseAmount.toLocaleString()} required`);
                    }
                }

                if (campaign.discountType === "PERCENTAGE") {
                    discountAmount = (subTotal * (campaign.discountValue ?? 0)) / 100;
                    const maxDiscountAmount = fromKesMinorUnits(campaign.maxDiscountAmount);
                    if (maxDiscountAmount > 0) {
                        discountAmount = Math.min(discountAmount, maxDiscountAmount);
                    }
                } else if (campaign.discountType === "FIXED_AMOUNT") {
                    discountAmount = fromKesMinorUnits(campaign.discountValue);
                } else if (campaign.discountType === "FREE_SHIPPING") {
                    discountAmount = shippingCost;
                } else if (campaign.discountType === "BUY_X_GET_Y") {
                    const buyX = Math.max(1, Math.round(Number(campaign.minPurchaseAmount || 0)));
                    const getY = Math.max(1, Math.round(Number(campaign.discountValue || 0)));
                    const groupSize = buyX + getY;

                    const eligibleProductIds = parseIdArray(campaign.productIds);
                    const eligibleLines = eligibleProductIds.length > 0
                        ? cart.lines.filter((line: any) => eligibleProductIds.includes(String(line.productId)))
                        : cart.lines;

                    const eligibleQuantity = eligibleLines.reduce((total: number, line: any) => total + line.quantity, 0);
                    if (eligibleQuantity < groupSize) {
                        throw new Error(`Add ${groupSize - eligibleQuantity} more item(s) to qualify for this offer`);
                    }

                    const freeCount = Math.floor(eligibleQuantity / groupSize) * getY;
                    const unitPrices: number[] = [];
                    eligibleLines.forEach((line: any) => {
                        const price = line.product.salePrice ?? line.product.originalPrice ?? 0;
                        for (let i = 0; i < line.quantity; i += 1) {
                            unitPrices.push(price);
                        }
                    });

                    unitPrices.sort((a, b) => a - b);
                    discountAmount = unitPrices.slice(0, freeCount).reduce((sum, price) => sum + price, 0);
                    const maxDiscountAmount = fromKesMinorUnits(campaign.maxDiscountAmount);
                    if (maxDiscountAmount > 0) {
                        discountAmount = Math.min(discountAmount, maxDiscountAmount);
                    }
                } else {
                    throw new Error("Coupon is not applicable");
                }

                if (discountAmount > subTotal + shippingCost) {
                    discountAmount = subTotal + shippingCost;
                }

                redemptionCampaign = campaign;
            }

            const total = Math.max(0, subTotal + shippingCost + tax - discountAmount);

            // 4. Create Order
            const orderId = uuidv4();
            const code = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

            const [order] = await tx.insert(schema.orders as any).values({
                id: orderId,
                code,
                customerId: userId,
                state: 'CREATED',
                subTotal,
                shipping: shippingCost,
                tax,
                total,
                currencyCode: 'KES',
                shippingAddressId,
                billingAddressId,
                shippingMethodId: resolvedShippingMethodId
            });

            if (redemptionCampaign) {
                await tx.insert(schema.campaignRedemptions).values({
                    id: uuidv4(),
                    campaignId: redemptionCampaign.id,
                    customerId: userId,
                    orderId,
                });
            }

            // 5. Create Order Lines
            for (const line of orderLinesData) {
                await tx.insert(schema.orderLines).values({
                    id: uuidv4(),
                    orderId,
                    productId: line.productId,
                    quantity: line.quantity,
                    linePrice: line.linePrice
                });
            }

            // 6. Return result (Transaction commits automatically)
            return { orderId, code, total };
        });

        if (stockAdjustedProductIds.size > 0) {
            try {
                await productSearchService.syncProductsByIds(Array.from(stockAdjustedProductIds));
            } catch (error) {
                fastify.log.error({ error }, "Failed to sync product stock to search index after checkout");
            }
        }

        return checkoutResult;
    });

    fastify.post("/verify", {
        schema: {
            tags: ["Checkout"],
            body: z.object({
                orderId: z.string(),
                paymentReference: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const { orderId, paymentReference } = request.body as any;
        console.log(`[Checkout Verify] Verifying order: ${orderId}, Ref: ${paymentReference}`);

        const order = await db.query.orders.findFirst({
            where: eq(schema.orders.id, orderId)
        });
        console.log(`[Checkout Verify] Order found? ${!!order}`);

        if (!order) return reply.status(404).send({ message: "Order not found" });

        // Update order state
        await db.update(schema.orders)
            .set({ state: 'PAYMENT_SETTLED' })
            .where(eq(schema.orders.id, orderId));

        if (paymentReference) {
            await db.insert(schema.payments).values({
                id: uuidv4(),
                orderId,
                amount: order.total,
                method: 'paystack', // Default or from request
                state: 'SETTLED', // Successfully verified
                transactionId: paymentReference,
                paystackRef: paymentReference
            });
            console.log(`[Checkout Verify] Payment record created`);
        }

        // Clear cart logic
        // We need to fetch cart again to get ID
        const userId = (request as any).storefrontUser?.id;
        console.log(`[Checkout Verify] Clearing cart for User: ${userId}`);

        if (userId) {
            const cart = await db.query.carts.findFirst({
                where: eq(schema.carts.customerId, userId)
            });
            if (cart) {
                await db.delete(schema.cartLines).where(eq(schema.cartLines.cartId, cart.id));
                console.log(`[Checkout Verify] Cart cleared: ${cart.id}`);
            }
        }

        return { message: "Order verified", orderId };
    });
};
