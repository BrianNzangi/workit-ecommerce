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
     * Get a list of orders
     */
    async getOrders(options: OrderListOptions = {}): Promise<Order[]> {
        const response: any = await this.adminClient.orders.list(options);
        // Frontend filtering for now since backend list doesn't take params yet
        let results = Array.isArray(response) ? response : (response.orders || []);
        if (options.state) {
            results = results.filter((o: Order) => o.state === options.state);
        }
        return results;
    }

    /**
     * Search orders (Filtered locally for now as search is not in backend yet)
     */
    async searchOrders(searchTerm: string): Promise<Order[]> {
        const response: any = await this.adminClient.orders.list();
        const results = Array.isArray(response) ? response : (response.orders || []);
        const term = searchTerm.toLowerCase();
        return results.filter((o: Order) =>
            o.code.toLowerCase().includes(term) ||
            o.customer?.email?.toLowerCase().includes(term) ||
            (o.customer as any)?.name?.toLowerCase().includes(term)
        );
    }

    /**
     * Get inventory items (Staging for low stock alerts)
     */
    async getInventory(options: { lowStockThreshold?: number } = {}): Promise<any[]> {
        // This should ideally call a backend endpoint
        return [];
    }
}
