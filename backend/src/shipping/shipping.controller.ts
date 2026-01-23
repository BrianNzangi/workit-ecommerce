import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller() // Use base for nested routes if needed, but we'll use specific paths
@UseGuards(JwtAuthGuard)
export class ShippingController {
    constructor(private shippingService: ShippingService) { }

    @Get('shipping-methods')
    async findAllMethods() {
        return this.shippingService.findAllMethods();
    }

    @Post('shipping-zones')
    async createZone(@Body() input: any) {
        return this.shippingService.createZone(input);
    }

    @Patch('shipping-zones/:id')
    async updateZone(@Param('id') id: string, @Body() input: any) {
        return this.shippingService.updateZone(id, input);
    }

    @Delete('shipping-zones/:id')
    async deleteZone(@Param('id') id: string) {
        return this.shippingService.deleteZone(id);
    }
}
