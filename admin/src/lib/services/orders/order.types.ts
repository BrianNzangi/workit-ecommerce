export interface AddressInput {
    firstName: string;
    lastName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phoneNumber?: string;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    salePrice?: number;
    originalPrice?: number;
}

export interface CheckoutInput {
    items: OrderItem[];
    customerEmail: string;
    customerName: string;
    customerId?: string;
    shippingAddress: AddressInput;
    billingAddress?: AddressInput;
    shippingMethodId: string;
    shippingCost?: number;
}

export interface Order {
    id: string;
    code: string;
    customerId: string;
    shippingAddressId: string | null;
    billingAddressId: string | null;
    shippingMethodId: string | null;
    subTotal: number;
    shipping: number;
    tax: number;
    total: number;
    state: string;
    currencyCode: string;
    createdAt: string;
    updatedAt: string;
    customer?: any;
    lines?: any[] | null;
    payments?: any[] | null;
    shippingAddress?: any;
    billingAddress?: any;
}

export interface OrderListResponse {
    orders: Order[];
}

export interface OrderListOptions {
    take?: number;
    skip?: number;
    state?: string;
}
