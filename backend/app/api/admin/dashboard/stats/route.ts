import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Count active products (enabled: true, not deleted)
        // detailed logic: active usually means enabled is true and it hasn't been soft deleted
        const activeProductsCount = await prisma.product.count({
            where: {
                enabled: true,
                deletedAt: null
            }
        });

        // Count all orders
        const totalOrdersCount = await prisma.order.count();

        // Count all customers
        const totalCustomersCount = await prisma.customer.count();

        // Calculate revenue (sum of total from settled/completed orders)
        // Assuming revenue comes from orders that are at least paid
        const revenueResult = await prisma.order.aggregate({
            _sum: {
                total: true
            },
            where: {
                state: {
                    in: ['PAYMENT_SETTLED', 'SHIPPED', 'DELIVERED']
                }
            }
        });
        const totalRevenue = revenueResult._sum.total || 0;

        return NextResponse.json({
            products: activeProductsCount,
            orders: totalOrdersCount,
            customers: totalCustomersCount,
            revenue: totalRevenue // This is in cents
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
