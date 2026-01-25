import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq, and, desc, or } from 'drizzle-orm';

interface CheckoutInput {
    customerId?: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: {
        fullName: string;
        streetLine1: string;
        streetLine2?: string;
        city: string;
        province: string;
        postalCode: string;
        phoneNumber: string;
    };
    billingAddress?: {
        fullName: string;
        streetLine1: string;
        streetLine2?: string;
        city: string;
        province: string;
        postalCode: string;
        phoneNumber: string;
    };
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    shippingMethodId: string;
    shippingCost: number;
}

@Injectable()
export class StoreOrdersService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    /**
     * Create order from checkout
     */
    async createOrder(input: CheckoutInput) {
        // Validate products and stock
        for (const item of input.items) {
            const [product] = await this.db
                .select()
                .from(schema.products)
                .where(
                    and(
                        eq(schema.products.id, item.productId),
                        eq(schema.products.enabled, true)
                    )
                )
                .limit(1);

            if (!product) {
                throw new BadRequestException(`Product ${item.productId} not found`);
            }

            if (product.stockOnHand < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for ${product.name}. Available: ${product.stockOnHand}, Requested: ${item.quantity}`
                );
            }
        }

        // Calculate totals (Prices are VAT-inclusive)
        const itemTotalInclusive = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingInclusive = input.shippingCost || 0;
        const netTotalInclusive = itemTotalInclusive + shippingInclusive;

        // VAT Extraction (Formula: VAT = Total - (Total / 1.16))
        const taxRate = 1.16;
        const totalExclusive = netTotalInclusive / taxRate;
        const taxAmountTotal = netTotalInclusive - totalExclusive;

        // Break down for DB storage
        const itemTotalExclusive = itemTotalInclusive / taxRate;
        const shippingExclusive = shippingInclusive / taxRate;

        const subtotal = itemTotalExclusive;
        const taxAmount = taxAmountTotal;
        const total = netTotalInclusive;
        const shipping = shippingExclusive;

        // Create or get customer - always verify by email to avoid FK issues with external IDs
        let customerId: string;

        const [existingCustomer] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, input.customerEmail))
            .limit(1);

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            // Create user record (guest or first-time sync)
            const [newCustomer] = await this.db
                .insert(schema.user)
                .values({
                    id: crypto.randomUUID(),
                    email: input.customerEmail,
                    name: input.customerName,
                    firstName: input.customerName.split(' ')[0] || input.customerName,
                    lastName: input.customerName.split(' ').slice(1).join(' ') || '',
                    emailVerified: false,
                    role: 'CUSTOMER',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();
            customerId = newCustomer.id;
        }

        // Resolve shipping method ID if a code was provided (e.g., 'standard')
        let shippingMethodId = input.shippingMethodId;
        if (shippingMethodId) {
            const [method] = await this.db
                .select({ id: schema.shippingMethods.id })
                .from(schema.shippingMethods)
                .where(or(
                    eq(schema.shippingMethods.id, shippingMethodId),
                    eq(schema.shippingMethods.code, shippingMethodId)
                ))
                .limit(1);

            if (method) {
                shippingMethodId = method.id;
            } else {
                console.warn(`Shipping method not found for query: ${shippingMethodId}. Proceeding with original ID.`);
            }
        }

        // Create shipping address
        const [shippingAddress] = await this.db
            .insert(schema.addresses)
            .values({
                customerId,
                ...input.shippingAddress,
                country: 'KE',
            })
            .returning();

        // Create billing address (use shipping if not provided)
        const billingAddressData = input.billingAddress || input.shippingAddress;
        const [billingAddress] = await this.db
            .insert(schema.addresses)
            .values({
                customerId,
                ...billingAddressData,
                country: 'KE',
            })
            .returning();

        // Create order
        const [order] = await this.db
            .insert(schema.orders)
            .values({
                code: `ORD-${Date.now()}`,
                customerId,
                state: 'CREATED',
                subTotal: Math.round(subtotal),
                shipping: Math.round(shipping),
                tax: Math.round(taxAmount),
                total: Math.round(total),
                currencyCode: 'KES',
                shippingAddressId: shippingAddress.id,
                billingAddressId: billingAddress.id,
                shippingMethodId: shippingMethodId,
            })
            .returning();

        // Create order lines
        for (const item of input.items) {
            const [product] = await this.db
                .select({
                    name: schema.products.name,
                    stockOnHand: schema.products.stockOnHand,
                })
                .from(schema.products)
                .where(eq(schema.products.id, item.productId))
                .limit(1);

            await this.db
                .insert(schema.orderLines)
                .values({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    linePrice: Math.round(item.price * item.quantity),
                });

            // Reduce stock
            await this.db
                .update(schema.products)
                .set({
                    stockOnHand: product.stockOnHand - item.quantity,
                    updatedAt: new Date(),
                })
                .where(eq(schema.products.id, item.productId));
        }

        return {
            orderId: order.id,
            orderCode: order.code,
            total: order.total,
            customerId,
        };
    }

    /**
     * Verify payment and update order status
     */
    async verifyPayment(orderId: string, paymentData: {
        reference: string;
        amount: number;
        status: string;
        provider: 'PAYSTACK' | 'MPESA';
    }) {
        const [order] = await this.db
            .select()
            .from(schema.orders)
            .where(eq(schema.orders.id, orderId))
            .limit(1);

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // Verify amount matches
        if (Math.abs(paymentData.amount - order.total) > 1) {
            throw new BadRequestException('Payment amount mismatch');
        }

        // Create payment record
        await this.db
            .insert(schema.payments)
            .values({
                orderId: order.id,
                amount: Math.round(paymentData.amount),
                method: paymentData.provider.toLowerCase(),
                state: paymentData.status === 'success' ? 'SETTLED' : 'DECLINED',
                transactionId: paymentData.reference,
                metadata: paymentData,
            });

        // Update order state
        if (paymentData.status === 'success') {
            await this.db
                .update(schema.orders)
                .set({
                    state: 'PAYMENT_SETTLED',
                    updatedAt: new Date(),
                })
                .where(eq(schema.orders.id, orderId));
        }

        return {
            success: paymentData.status === 'success',
            orderId: order.id,
            orderCode: order.code,
        };
    }

    /**
     * Get customer orders
     */
    async getCustomerOrders(customerId: string) {
        const orders = await this.db
            .select()
            .from(schema.orders)
            .where(eq(schema.orders.customerId, customerId))
            .orderBy(desc(schema.orders.createdAt));

        // Enrich with order lines
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const lines = await this.db
                    .select({
                        id: schema.orderLines.id,
                        productId: schema.orderLines.productId,
                        quantity: schema.orderLines.quantity,
                        linePrice: schema.orderLines.linePrice,
                        name: schema.products.name,
                    })
                    .from(schema.orderLines)
                    .leftJoin(schema.products, eq(schema.orderLines.productId, schema.products.id))
                    .where(eq(schema.orderLines.orderId, order.id));

                const payments = await this.db
                    .select()
                    .from(schema.payments)
                    .where(eq(schema.payments.orderId, order.id));

                return {
                    ...order,
                    lines,
                    payments,
                };
            })
        );

        return enrichedOrders;
    }

    /**
     * Get orders by customer email
     */
    async getCustomerOrdersByEmail(email: string) {
        // First find the user
        const [user] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.email, email))
            .limit(1);

        if (!user) {
            return [];
        }

        return this.getCustomerOrders(user.id);
    }

    /**
     * Get single order details
     */
    async getOrder(orderId: string, customerId?: string) {
        const conditions = [eq(schema.orders.id, orderId)];
        if (customerId) {
            conditions.push(eq(schema.orders.customerId, customerId));
        }

        const [order] = await this.db
            .select()
            .from(schema.orders)
            .where(and(...conditions))
            .limit(1);

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        const lines = await this.db
            .select()
            .from(schema.orderLines)
            .where(eq(schema.orderLines.orderId, order.id));

        const payments = await this.db
            .select()
            .from(schema.payments)
            .where(eq(schema.payments.orderId, order.id));

        // Get addresses
        let shippingAddress: any = null;
        let billingAddress: any = null;

        if (order.shippingAddressId) {
            [shippingAddress] = await this.db
                .select()
                .from(schema.addresses)
                .where(eq(schema.addresses.id, order.shippingAddressId))
                .limit(1);
        }

        if (order.billingAddressId) {
            [billingAddress] = await this.db
                .select()
                .from(schema.addresses)
                .where(eq(schema.addresses.id, order.billingAddressId))
                .limit(1);
        }

        return {
            ...order,
            lines,
            payments,
            shippingAddress,
            billingAddress,
        };
    }
}
