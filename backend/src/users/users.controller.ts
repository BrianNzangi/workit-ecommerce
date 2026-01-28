import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';

@Controller('users')
@UseGuards(BetterAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Post()
    async create(@Body() input: any) {
        return this.usersService.create(input);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() input: any) {
        return this.usersService.update(id, input);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}
