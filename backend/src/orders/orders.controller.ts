import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './orders.service';
import { checkoutSchema } from '@workit/validation';
import type { CheckoutInput } from '@workit/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private orderService: OrderService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        const orders = await this.orderService.findAll();
        return { success: true, orders };
    }

    @UseGuards(JwtAuthGuard)
    @Post('checkout')
    async checkout(
        @Request() req,
        @Body(new ZodValidationPipe(checkoutSchema)) input: CheckoutInput
    ) {
        // Assuming req.user contains the authenticated customer/user
        return this.orderService.createOrder(req.user.id, input);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMyOrders(@Request() req) {
        return this.orderService.getCustomerOrders(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getOrder(@Param('id') id: string) {
        const order = await this.orderService.getOrder(id);
        return { success: true, order };
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('state') state: string
    ) {
        const order = await this.orderService.updateOrderStatus(id, state);
        return { success: true, order };
    }
}
