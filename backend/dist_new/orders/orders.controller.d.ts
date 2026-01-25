import { OrderService } from './orders.service';
import type { CheckoutInput } from '@workit/validation';
export declare class OrdersController {
    private orderService;
    constructor(orderService: OrderService);
    findAll(): Promise<{
        success: boolean;
        orders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shippingMethodId: string | null;
            code: string;
            customerId: string;
            state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            subTotal: number;
            shipping: number;
            tax: number;
            total: number;
            currencyCode: string;
            shippingAddressId: string | null;
            billingAddressId: string | null;
            customer: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                role: "ADMIN" | "CUSTOMER" | null;
                firstName: string | null;
                lastName: string | null;
            };
        }[];
    }>;
    checkout(req: any, input: CheckoutInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shippingMethodId: string | null;
        code: string;
        customerId: string;
        state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        subTotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        shippingAddressId: string | null;
        billingAddressId: string | null;
    }>;
    getMyOrders(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shippingMethodId: string | null;
        code: string;
        customerId: string;
        state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        subTotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        shippingAddressId: string | null;
        billingAddressId: string | null;
    }[]>;
    getOrder(id: string): Promise<{
        success: boolean;
        order: {
            lines: {
                variant: {
                    name: string;
                    sku: string;
                    product: {
                        name: string;
                    };
                };
                id: string;
                productId: string;
                orderId: string;
                quantity: number;
                linePrice: number;
                product: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    slug: string;
                    sku: string | null;
                    salePrice: number | null;
                    originalPrice: number | null;
                    stockOnHand: number;
                    enabled: boolean;
                    condition: "NEW" | "REFURBISHED";
                    brandId: string | null;
                    shippingMethodId: string | null;
                    deletedAt: Date | null;
                };
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shippingMethodId: string | null;
            code: string;
            customerId: string;
            state: "CREATED" | "PAYMENT_PENDING" | "PAYMENT_AUTHORIZED" | "PAYMENT_SETTLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            subTotal: number;
            shipping: number;
            tax: number;
            total: number;
            currencyCode: string;
            shippingAddressId: string | null;
            billingAddressId: string | null;
            shippingAddress: {
                id: string;
                customerId: string | null;
                phoneNumber: string;
                fullName: string;
                streetLine1: string;
                streetLine2: string | null;
                city: string;
                province: string;
                postalCode: string;
                country: string;
                defaultShipping: boolean;
                defaultBilling: boolean;
            } | null;
            billingAddress: {
                id: string;
                customerId: string | null;
                phoneNumber: string;
                fullName: string;
                streetLine1: string;
                streetLine2: string | null;
                city: string;
                province: string;
                postalCode: string;
                country: string;
                defaultShipping: boolean;
                defaultBilling: boolean;
            } | null;
            customer: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                role: "ADMIN" | "CUSTOMER" | null;
                firstName: string | null;
                lastName: string | null;
            };
        };
    }>;
    updateStatus(id: string, state: string): Promise<{
        success: boolean;
        order: {
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
        };
    }>;
}
