import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StoreOrdersService } from './store-orders.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('store')
export class StoreOrdersController {
    constructor(private storeOrdersService: StoreOrdersService) { }

    /**
     * POST /store/orders/checkout
     * Create order from checkout (public endpoint)
     */
    @Post('orders/checkout')
    async checkout(@Body() checkoutData: any) {
        return this.storeOrdersService.createOrder(checkoutData);
    }

    /**
     * POST /store/payments/verify
     * Verify payment from Paystack/M-Pesa (public endpoint)
     */
    @Post('payments/verify')
    async verifyPayment(@Body() paymentData: {
        orderId: string;
        reference: string;
        amount: number;
        status: string;
        provider: 'PAYSTACK' | 'MPESA';
    }) {
        return this.storeOrdersService.verifyPayment(
            paymentData.orderId,
            paymentData
        );
    }

    /**
     * GET /store/orders/me
     * Get customer's orders (requires authentication)
     */
    @UseGuards(BetterAuthGuard)
    @Get('orders/me')
    async getMyOrders(@Request() req: any) {
        return this.storeOrdersService.getCustomerOrders(req.user.id);
    }

    /**
     * GET /store/orders/by-email/:email
     * Internal endpoint to get orders by email (used by storefront API)
     */
    @Get('orders/by-email/:email')
    async getOrdersByEmail(@Param('email') email: string) {
        const orders = await this.storeOrdersService.getCustomerOrdersByEmail(email);
        return { success: true, orders };
    }

    /**
     * GET /store/orders/:id
     * Get single order details (requires authentication)
     */
    @UseGuards(BetterAuthGuard)
    @Get('orders/:id')
    async getOrder(@Param('id') id: string, @Request() req: any) {
        return this.storeOrdersService.getOrder(id, req.user.id);
    }
}
