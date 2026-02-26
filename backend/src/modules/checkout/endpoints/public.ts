import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, and, ilike, isNotNull, count, or } from "../../../lib/db.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { productSearchService } from "../../../services/search/product-search.service.js";
import crypto from "crypto";

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

const normalizePaystackAmount = (value: number) => Math.round(Number(value) * 100);

const resolveMetadataOrderId = (metadata: any): string | null => {
    if (!metadata || typeof metadata !== "object") return null;
    const candidate = metadata.orderId || metadata.order_id;
    return candidate ? String(candidate) : null;
};

const parseOrderIdFromReference = (reference: string): string | null => {
    const match = /^order-([a-f0-9-]+)-\d+$/i.exec(reference);
    return match?.[1] || null;
};

export const checkoutPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook("preHandler", fastify.optionalStorefrontAuth);

    const verifyPaystackPayment = async (orderId: string, paymentReference?: string, userId?: string) => {
        const order = await db.query.orders.findFirst({
            where: eq(schema.orders.id, orderId)
        });
        console.log(`[Checkout Verify] Order found? ${!!order}`);

        if (!order) {
            return { status: 404, body: { message: "Order not found" } };
        }

        if (userId && order.customerId !== userId) {
            return { status: 403, body: { message: "Not authorized to verify this order" } };
        }

        if (!paymentReference) {
            if (order.state === "PAYMENT_SETTLED") {
                return { status: 200, body: { message: "Order already verified", orderId }, order };
            }
            return { status: 400, body: { message: "paymentReference is required" } };
        }

        const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecret) {
            fastify.log.error("PAYSTACK_SECRET_KEY is not configured");
            return { status: 500, body: { message: "Payment verification unavailable" } };
        }

        const verifyResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${paystackSecret}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const verifyText = await verifyResponse.text();
        if (!verifyResponse.ok) {
            fastify.log.error({
                status: verifyResponse.status,
                body: verifyText,
            }, "Paystack verification failed");
            return { status: 400, body: { message: "Payment verification failed" } };
        }

        let verifyPayload: any;
        try {
            verifyPayload = JSON.parse(verifyText);
        } catch {
            fastify.log.error({ verifyText }, "Invalid Paystack verification response");
            return { status: 400, body: { message: "Invalid verification response" } };
        }

        const paystackData = verifyPayload?.data;
        if (!paystackData || paystackData.status !== "success") {
            return { status: 400, body: { message: "Payment not successful" } };
        }

        const expectedAmount = normalizePaystackAmount(order.total);
        const paidAmount = Number(paystackData.amount);
        if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
            fastify.log.error({
                orderId,
                expectedAmount,
                paidAmount,
            }, "Paystack amount mismatch");
            return { status: 400, body: { message: "Payment amount mismatch" } };
        }

        const paystackCurrency = paystackData.currency ? String(paystackData.currency).toUpperCase() : null;
        const orderCurrency = String(order.currencyCode || "").toUpperCase();
        if (paystackCurrency && orderCurrency && paystackCurrency !== orderCurrency) {
            fastify.log.error({
                orderId,
                expected: orderCurrency,
                received: paystackCurrency,
            }, "Paystack currency mismatch");
            return { status: 400, body: { message: "Payment currency mismatch" } };
        }

        const metadataOrderId = resolveMetadataOrderId(paystackData.metadata);
        if (metadataOrderId && metadataOrderId !== orderId) {
            fastify.log.error({
                orderId,
                metadataOrderId,
            }, "Paystack metadata order mismatch");
            return { status: 400, body: { message: "Payment metadata mismatch" } };
        }

        const referenceOrderId = parseOrderIdFromReference(String(paystackData.reference || paymentReference));
        if (referenceOrderId && referenceOrderId !== orderId) {
            fastify.log.error({
                orderId,
                referenceOrderId,
            }, "Paystack reference order mismatch");
            return { status: 400, body: { message: "Payment reference mismatch" } };
        }

        const paystackId = paystackData.id ? String(paystackData.id) : undefined;
        const existingPayment = await db.query.payments.findFirst({
            where: or(
                eq(schema.payments.paystackRef, String(paystackData.reference || paymentReference)),
                paystackId ? eq(schema.payments.transactionId, paystackId) : eq(schema.payments.transactionId, "__none__")
            )
        });

        if (!existingPayment) {
            await db.insert(schema.payments).values({
                id: uuidv4(),
                orderId,
                amount: order.total,
                method: "paystack",
                state: "SETTLED",
                transactionId: paystackId,
                paystackRef: String(paystackData.reference || paymentReference),
                metadata: paystackData,
            });
            console.log(`[Checkout Verify] Payment record created`);
        }

        if (order.state !== "PAYMENT_SETTLED") {
            await db.update(schema.orders)
                .set({ state: "PAYMENT_SETTLED", updatedAt: new Date() })
                .where(eq(schema.orders.id, orderId));
        }

        return { status: 200, body: { message: "Order verified", orderId }, order };
    };

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
        const userId = (request as any).storefrontUser?.id;
        const verification = await verifyPaystackPayment(orderId, paymentReference, userId);
        if (verification.status !== 200) {
            return reply.status(verification.status).send(verification.body);
        }

        // Clear cart logic
        // We need to fetch cart again to get ID
        const customerId = userId || verification.order?.customerId;
        console.log(`[Checkout Verify] Clearing cart for User: ${customerId}`);

        if (customerId) {
            const cart = await db.query.carts.findFirst({
                where: eq(schema.carts.customerId, customerId)
            });
            if (cart) {
                await db.delete(schema.cartLines).where(eq(schema.cartLines.cartId, cart.id));
                console.log(`[Checkout Verify] Cart cleared: ${cart.id}`);
            }
        }

        return verification.body;
    });

    fastify.post("/webhook", {
        preParsing: (request, reply, payload, done) => {
            let data = "";
            payload.on("data", (chunk) => {
                data += chunk;
            });
            payload.on("end", () => {
                (request as any).rawBody = data;
                done(null, payload);
            });
        }
    }, async (request, reply) => {
        const rawBody = (request as any).rawBody as string | undefined;
        if (!rawBody) {
            return reply.status(400).send({ message: "Missing payload" });
        }

        const signature = request.headers["x-paystack-signature"];
        const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "";

        if (!paystackSecret) {
            fastify.log.error("PAYSTACK_SECRET_KEY is not configured");
            return reply.status(500).send({ message: "Webhook unavailable" });
        }

        const computed = crypto
            .createHmac("sha512", paystackSecret)
            .update(rawBody)
            .digest("hex");

        if (!signature || computed !== signature) {
            return reply.status(400).send({ message: "Invalid signature" });
        }

        let event: any;
        try {
            event = JSON.parse(rawBody);
        } catch {
            return reply.status(400).send({ message: "Invalid JSON payload" });
        }

        if (event?.event !== "charge.success") {
            return { status: "ignored" };
        }

        const reference = event?.data?.reference || event?.data?.trxref;
        const metadataOrderId = resolveMetadataOrderId(event?.data?.metadata);
        const referenceOrderId = reference ? parseOrderIdFromReference(String(reference)) : null;
        const orderId = metadataOrderId || referenceOrderId;

        if (!reference || !orderId) {
            fastify.log.warn({ reference, orderId }, "Paystack webhook missing reference/orderId");
            return { status: "ignored" };
        }

        const verification = await verifyPaystackPayment(orderId, reference);
        if (verification.status !== 200) {
            return reply.status(verification.status).send(verification.body);
        }

        const customerId = verification.order?.customerId;
        if (customerId) {
            const cart = await db.query.carts.findFirst({
                where: eq(schema.carts.customerId, customerId)
            });
            if (cart) {
                await db.delete(schema.cartLines).where(eq(schema.cartLines.cartId, cart.id));
                console.log(`[Checkout Verify] Cart cleared via webhook: ${cart.id}`);
            }
        }

        return { status: "success" };
    });
};
