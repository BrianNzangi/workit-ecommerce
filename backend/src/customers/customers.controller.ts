import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private customersService: CustomersService) { }

    @Get()
    async findAll() {
        const customers = await this.customersService.findAll();
        return { success: true, customers };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const customer = await this.customersService.findOne(id);
        return { success: true, customer };
    }

    @Post()
    async create(@Body() input: any) {
        const customer = await this.customersService.create(input);
        return { success: true, customer };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() input: any) {
        const customer = await this.customersService.update(id, input);
        return { success: true, customer };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.customersService.delete(id);
    }
}
