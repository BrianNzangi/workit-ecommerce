import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
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
export declare class StoreOrdersService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    createOrder(input: CheckoutInput): Promise<{
        orderId: string;
        orderCode: string;
        total: number;
        customerId: string;
    }>;
    verifyPayment(orderId: string, paymentData: {
        reference: string;
        amount: number;
        status: string;
        provider: 'PAYSTACK' | 'MPESA';
    }): Promise<{
        success: boolean;
        orderId: string;
        orderCode: string;
    }>;
    getCustomerOrders(customerId: string): Promise<{
        lines: {
            id: string;
            productId: string;
            quantity: number;
            linePrice: number;
            name: string | null;
        }[];
        payments: {
            id: string;
            orderId: string;
            method: string;
            amount: number;
            state: "CANCELLED" | "PENDING" | "AUTHORIZED" | "SETTLED" | "DECLINED" | "ERROR";
            transactionId: string | null;
            paystackRef: string | null;
            metadata: unknown;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        code: string;
        customerId: string;
        state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        subTotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        shippingAddressId: string | null;
        billingAddressId: string | null;
        shippingMethodId: string | null;
    }[]>;
    getCustomerOrdersByEmail(email: string): Promise<{
        lines: {
            id: string;
            productId: string;
            quantity: number;
            linePrice: number;
            name: string | null;
        }[];
        payments: {
            id: string;
            orderId: string;
            method: string;
            amount: number;
            state: "CANCELLED" | "PENDING" | "AUTHORIZED" | "SETTLED" | "DECLINED" | "ERROR";
            transactionId: string | null;
            paystackRef: string | null;
            metadata: unknown;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        code: string;
        customerId: string;
        state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        subTotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        shippingAddressId: string | null;
        billingAddressId: string | null;
        shippingMethodId: string | null;
    }[]>;
    getOrder(orderId: string, customerId?: string): Promise<{
        lines: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            linePrice: number;
        }[];
        payments: {
            id: string;
            orderId: string;
            method: string;
            amount: number;
            state: "CANCELLED" | "PENDING" | "AUTHORIZED" | "SETTLED" | "DECLINED" | "ERROR";
            transactionId: string | null;
            paystackRef: string | null;
            metadata: unknown;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        shippingAddress: any;
        billingAddress: any;
        id: string;
        code: string;
        customerId: string;
        state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        subTotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        shippingAddressId: string | null;
        billingAddressId: string | null;
        shippingMethodId: string | null;
    }>;
}
export {};
