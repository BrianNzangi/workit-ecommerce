import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, and } from "../../../lib/db.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const cartPublicRoutes: FastifyPluginAsync = async (fastify) => {
    const getCart = async (req: any) => {
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'] as string;

        if (!userId && !guestId) return null;

        const where = userId
            ? eq(schema.carts.customerId as any, userId)
            : eq(schema.carts.guestId as any, guestId);

        const cart = await (db as any).query.carts.findFirst({
            where,
            with: {
                lines: {
                    with: {
                        product: {
                            with: {
                                assets: {
                                    with: {
                                        asset: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return cart;
    };

    fastify.get("/", {
        schema: {
            tags: ["Cart"]
        }
    }, async (request, reply) => {
        const cart = await getCart(request);
        if (!cart) return { lines: [] };
        return cart;
    });

    fastify.post("/", {
        schema: {
            tags: ["Cart"],
            body: z.object({
                productId: z.string(),
                quantity: z.number().min(1).default(1)
            })
        }
    }, async (request, reply) => {
        const { productId, quantity } = request.body as any;
        const userId = (request as any).user?.id;
        const guestId = request.headers['x-guest-id'] as string;

        console.log(`[Cart DEBUG] POST / - Product: ${productId}, Qty: ${quantity}, User: ${userId}, Guest: ${guestId}`);

        if (!userId && !guestId) {
            console.log('[Cart DEBUG] Rejecting: No User or Guest ID');
            return reply.status(400).send({ message: "Guest ID or User required" });
        }

        let cart = await getCart(request);
        console.log(`[Cart DEBUG] Existing cart found? ${!!cart} (ID: ${cart?.id})`);

        if (!cart) {
            const cartId = uuidv4();
            console.log(`[Cart DEBUG] Creating new cart: ${cartId} (User: ${userId}, Guest: ${userId ? 'null' : guestId})`);
            await db.insert(schema.carts as any).values({
                id: cartId,
                customerId: userId || null,
                guestId: userId ? null : guestId
            });
            // Fetch the newly created cart or just use the ID
            cart = { id: cartId } as any;
        }

        const existingLine = await (db as any).query.cartLines.findFirst({
            where: and(
                eq(schema.cartLines.cartId as any, cart!.id),
                eq(schema.cartLines.productId as any, productId)
            )
        });

        if (existingLine) {
            console.log(`[Cart DEBUG] Updating existing line: ${existingLine.id}`);
            await db.update(schema.cartLines as any)
                .set({ quantity: existingLine.quantity + quantity })
                .where(eq(schema.cartLines.id as any, existingLine.id));
        } else {
            console.log(`[Cart DEBUG] Insert new line for product: ${productId}`);
            await db.insert(schema.cartLines as any).values({
                id: uuidv4(),
                cartId: cart!.id,
                productId,
                quantity
            });
        }

        return getCart(request); // Return updated cart
    });

    fastify.put("/:lineId", {
        schema: {
            tags: ["Cart"],
            params: z.object({
                lineId: z.string()
            }),
            body: z.object({
                quantity: z.number().min(1)
            })
        }
    }, async (request, reply) => {
        const { lineId } = request.params as any;
        const { quantity } = request.body as any;
        const cart = await getCart(request);

        if (!cart) return reply.status(404).send({ message: "Cart not found" });

        // Verify line belongs to cart
        const line = await (db as any).query.cartLines.findFirst({
            where: and(
                eq(schema.cartLines.id as any, lineId),
                eq(schema.cartLines.cartId as any, cart.id)
            )
        });

        if (!line) return reply.status(404).send({ message: "Line item not found in cart" });

        await db.update(schema.cartLines as any)
            .set({ quantity })
            .where(eq(schema.cartLines.id as any, lineId));

        return getCart(request);
    });

    fastify.delete("/:lineId", {
        schema: {
            tags: ["Cart"],
            params: z.object({
                lineId: z.string()
            })
        }
    }, async (request, reply) => {
        const { lineId } = request.params as any;
        const cart = await getCart(request);

        if (!cart) return reply.status(404).send({ message: "Cart not found" });

        await db.delete(schema.cartLines as any)
            .where(and(
                eq(schema.cartLines.id as any, lineId),
                eq(schema.cartLines.cartId as any, cart.id)
            ));

        return getCart(request);
    });

    fastify.delete("/", {
        schema: {
            tags: ["Cart"]
        }
    }, async (request, reply) => {
        const cart = await getCart(request);
        if (!cart) return { message: "Cart emptied" };

        await db.delete(schema.cartLines as any).where(eq(schema.cartLines.cartId as any, cart.id));
        return { message: "Cart emptied", lines: [] };
    });
};
