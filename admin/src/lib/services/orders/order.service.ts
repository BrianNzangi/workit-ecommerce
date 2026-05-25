import { BaseService } from '../base/base.service';
import { Order, CheckoutInput, OrderListOptions } from './order.types';

export class OrderService extends BaseService {
    /**
     * Create a new order (Checkout)
     */
    async createOrder(input: CheckoutInput): Promise<any> {
        return this.adminClient.orders.create(input);
    }

    /**
     * Update order status
     */
    async updateOrderStatus(id: string, state: string): Promise<Order> {
        return this.adminClient.orders.updateStatus(id, { state });
    }

    /**
     * Get a single order by ID
     */
    async getOrder(id: string): Promise<Order | null> {
        try {
            return await this.adminClient.orders.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    /**
     * Get a list of orders — filter params are forwarded to the backend, no client-side filtering
     */
    async getOrders(options: OrderListOptions = {}): Promise<Order[]> {
        const response: any = await this.adminClient.orders.list(options);
        return Array.isArray(response) ? response : (response.orders || []);
    }

    /**
     * Search orders by term — delegates to backend via q param
     */
    async searchOrders(searchTerm: string): Promise<Order[]> {
        const response: any = await this.adminClient.orders.list({ q: searchTerm });
        return Array.isArray(response) ? response : (response.orders || []);
    }

    /**
     * Get inventory items with optional low-stock threshold
     */
    async getInventory(options: { lowStockThreshold?: number } = {}): Promise<any[]> {
        const response: any = await this.adminClient.products.inventory(options);
        return Array.isArray(response) ? response : (response.products || []);
    }
}
