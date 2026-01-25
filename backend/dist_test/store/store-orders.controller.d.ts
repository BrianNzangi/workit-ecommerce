import { StoreOrdersService } from './store-orders.service';
export declare class StoreOrdersController {
    private storeOrdersService;
    constructor(storeOrdersService: StoreOrdersService);
    checkout(checkoutData: any): Promise<{
        orderId: string;
        orderCode: string;
        total: number;
        customerId: string;
    }>;
    verifyPayment(paymentData: {
        orderId: string;
        reference: string;
        amount: number;
        status: string;
        provider: 'PAYSTACK' | 'MPESA';
    }): Promise<{
        success: boolean;
        orderId: string;
        orderCode: string;
    }>;
    getMyOrders(req: any): Promise<{
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
    getOrdersByEmail(email: string): Promise<{
        success: boolean;
        orders: {
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
        }[];
    }>;
    getOrder(id: string, req: any): Promise<{
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
