import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, orders, orderLines, products, addresses } from '@workit/db';
import { eq } from 'drizzle-orm';
import type { CheckoutInput } from '@workit/validation';

@Injectable()
export class OrderService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    private async generateOrderCode(): Promise<string> {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    async createOrder(customerId: string, input: CheckoutInput) {
        return await this.db.transaction(async (tx) => {
            // 1. Generate Order Code
            const code = await this.generateOrderCode();

            // 2. Create Addresses
            const [shippingAddr] = await tx.insert(addresses).values({
                customerId,
                fullName: input.shippingAddress.fullName,
                streetLine1: input.shippingAddress.streetLine1,
                streetLine2: input.shippingAddress.streetLine2,
                city: input.shippingAddress.city,
                province: input.shippingAddress.province,
                postalCode: input.shippingAddress.postalCode,
                country: input.shippingAddress.country,
                phoneNumber: input.shippingAddress.phoneNumber,
                defaultShipping: false,
                defaultBilling: false,
            }).returning();

            let billingAddrId = shippingAddr.id;
            if (input.billingAddress) {
                const [billingAddr] = await tx.insert(addresses).values({
                    customerId,
                    fullName: input.billingAddress.fullName,
                    streetLine1: input.billingAddress.streetLine1,
                    streetLine2: input.billingAddress.streetLine2,
                    city: input.billingAddress.city,
                    province: input.billingAddress.province,
                    postalCode: input.billingAddress.postalCode,
                    country: input.billingAddress.country,
                    phoneNumber: input.billingAddress.phoneNumber,
                    defaultShipping: false,
                    defaultBilling: false,
                }).returning();
                billingAddrId = billingAddr.id;
            }

            // 3. Calculate Totals and check stock
            let subTotal = 0;
            const verifiedLines: { productId: string; quantity: number; linePrice: number }[] = [];

            for (const line of input.items) {
                const product = await tx.query.products.findFirst({
                    where: eq(products.id, line.productId),
                });

                if (!product) {
                    throw new NotFoundException(`Product ${line.productId} not found`);
                }

                if (product.stockOnHand < line.quantity) {
                    throw new BadRequestException(`Insufficient stock for ${product.name}`);
                }

                const linePrice = (product.salePrice || 0) * line.quantity;
                subTotal += linePrice;
                verifiedLines.push({
                    productId: product.id,
                    quantity: line.quantity,
                    linePrice,
                });

                // Decrement Stock
                await tx.update(products)
                    .set({ stockOnHand: product.stockOnHand - line.quantity })
                    .where(eq(products.id, product.id));
            }

            // 4. Create Order
            const [order] = await tx.insert(orders).values({
                code,
                customerId,
                shippingAddressId: shippingAddr.id,
                billingAddressId: billingAddrId,
                shippingMethodId: input.shippingMethodId,
                subTotal,
                shipping: 0, // Explicitly set default shipping cost
                tax: 0, // Explicitly set default tax
                total: subTotal,
                state: 'CREATED',
                currencyCode: 'KES',
            }).returning();

            // 5. Create Order Lines
            for (const line of verifiedLines) {
                await tx.insert(orderLines).values({
                    orderId: order.id,
                    productId: line.productId,
                    quantity: line.quantity,
                    linePrice: line.linePrice,
                });
            }

            return order;
        });
    }

    async getOrder(id: string) {
        const order = await this.db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: {
                lines: {
                    with: {
                        product: true,
                    }
                },
                shippingAddress: true,
                billingAddress: true,
                customer: true,
            }
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Map product to variant for admin UI compatibility
        const enrichedLines = (order.lines || []).map(line => ({
            ...line,
            variant: {
                name: line.product?.name || 'Unknown Product',
                sku: line.product?.sku || '',
                product: {
                    name: line.product?.name || 'Unknown Product',
                }
            }
        }));

        return {
            ...order,
            lines: enrichedLines
        };
    }

    async getCustomerOrders(customerId: string) {
        return this.db.query.orders.findMany({
            where: eq(orders.customerId, customerId),
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        });
    }

    async findAll() {
        return this.db.query.orders.findMany({
            with: {
                customer: true,
            },
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        });
    }

    async updateOrderStatus(id: string, state: string) {
        const [order] = await this.db.update(orders)
            .set({ state: state as any, updatedAt: new Date() })
            .where(eq(orders.id, id))
            .returning();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }
}
