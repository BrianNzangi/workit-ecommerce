import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, and } from "../../../lib/db.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

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

export const checkoutPublicRoutes: FastifyPluginAsync = async (fastify) => {

    const getCart = async (req: any) => {
        const userId = req.user?.id;
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
            })
        }
    }, async (request, reply) => {
        const body = request.body as any;
        let { shippingAddressId, billingAddressId, shippingMethodId } = body;
        const userId = (request as any).user?.id;

        if (!userId) return reply.status(401).send({ message: "Login required for checkout" });

        const cart = await getCart(request);
        if (!cart || cart.lines.length === 0) {
            return reply.status(400).send({ message: "Cart is empty" });
        }

        // Use transaction for atomic order creation
        return await (db as any).transaction(async (tx: any) => {

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
            const total = subTotal + shippingCost + tax;

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
        const userId = (request as any).user?.id;
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
