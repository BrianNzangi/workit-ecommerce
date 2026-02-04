import { orders } from '@workit/api';

export type Order = orders.Order;
export type CheckoutInput = orders.CheckoutInput;
export type OrderListResponse = orders.OrderListResponse;

export interface OrderListOptions {
    take?: number;
    skip?: number;
    state?: string;
}
