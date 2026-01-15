import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, subWeeks, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || 'this_week'; // 'this_week' or 'last_week'

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (range === 'last_week') {
            const lastWeek = subWeeks(now, 1);
            startDate = startOfWeek(lastWeek, { weekStartsOn: 0 }); // Sunday
            endDate = endOfWeek(lastWeek, { weekStartsOn: 0 });
        } else {
            startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
            endDate = endOfWeek(now, { weekStartsOn: 0 });
        }

        // 1. Customers Count (Total active customers)
        const customers = await prisma.customer.count({
            where: { enabled: true }
        });

        // 2. Total Products (Active products)
        const totalProducts = await prisma.product.count({
            where: { enabled: true, deletedAt: null }
        });

        // 3. Stock Products (Total stock across all variants or products with stock?)
        // "Stock Products" typically means quantity of items or number of products in stock.
        // Given the number 2.5k vs 3.5k total, it likely means products with > 0 stock.
        // Let's count variants with stock > 0 for now as an approximation, or products.
        // A better approach for "Stock Products" vs "Total Products":
        // Total Products = all products.
        // Stock Products = items in stock (sum of stockOnHand).
        const variantsWithStock = await prisma.productVariant.aggregate({
            _sum: {
                stockOnHand: true
            },
            where: {
                enabled: true
            }
        });

        // 4. Out of Stock (Number of variants with 0 stock)
        const outOfStock = await prisma.productVariant.count({
            where: {
                stockOnHand: 0,
                enabled: true
            }
        });

        // 5. Revenue (Orders in the selected week)
        const revenueResult = await prisma.order.aggregate({
            _sum: {
                total: true
            },
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                state: {
                    not: 'CANCELLED' // Exclude cancelled orders
                }
            }
        });

        return NextResponse.json({
            customers: customers,
            totalProducts: totalProducts,
            stockProducts: variantsWithStock._sum.stockOnHand || 0,
            outOfStock: outOfStock,
            revenue: revenueResult._sum.total || 0,
        });

    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
