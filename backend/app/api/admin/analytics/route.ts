import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';

        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Get previous period for comparison
        const periodLength = now.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);

        // Fetch current period data
        const [
            currentOrders,
            previousOrders,
            totalCustomers,
            previousCustomers,
            totalProducts,
            campaigns,
            recentOrders,
        ] = await Promise.all([
            // Current period orders
            prisma.order.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                    },

                },
            }),
            // Previous period orders
            prisma.order.findMany({
                where: {
                    createdAt: {
                        gte: previousStartDate,
                        lt: startDate,
                    },

                },
            }),
            // Total customers (current period)
            prisma.customer.count({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                },
            }),
            // Previous period customers
            prisma.customer.count({
                where: {
                    createdAt: {
                        gte: previousStartDate,
                        lt: startDate,
                    },
                },
            }),
            // Total products
            prisma.product.count({
                where: {
                    enabled: true,
                },
            }),
            // Marketing campaigns
            prisma.marketingCampaign.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                    },
                },
            }),
            // Recent orders
            prisma.order.findMany({
                take: 10,
                orderBy: {
                    createdAt: 'desc',
                },
                where: {

                },
                include: {
                    customer: true,
                },
            }),
        ]);

        // Calculate revenue
        const currentRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
        const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
        const revenueChange = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        // Calculate order change
        const orderChange = previousOrders.length > 0
            ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
            : 0;

        // Calculate customer change
        const customerChange = previousCustomers > 0
            ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
            : 0;

        // Calculate campaign metrics
        const totalCampaigns = campaigns.length;
        const avgOpenRate = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length
            : 0;
        const avgClickRate = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length
            : 0;

        // Get top products (simplified - based on order lines)
        const orderLines = await prisma.orderLine.findMany({
            where: {
                order: {
                    createdAt: {
                        gte: startDate,
                    },

                },
            },
            include: {
                variant: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Aggregate product sales
        const productSales = orderLines.reduce((acc, line) => {
            const productId = line.variant.product.id;
            const productName = line.variant.product.name;

            if (!acc[productId]) {
                acc[productId] = {
                    id: productId,
                    name: productName,
                    sales: 0,
                    revenue: 0,
                };
            }

            acc[productId].sales += line.quantity;
            acc[productId].revenue += line.linePrice;

            return acc;
        }, {} as Record<string, { id: string; name: string; sales: number; revenue: number }>);

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Format recent orders
        const formattedRecentOrders = recentOrders.map((order) => ({
            id: order.id,
            code: order.code,
            customer: `${order.customer.firstName} ${order.customer.lastName}`,
            total: order.total,
            status: order.state,
            createdAt: order.createdAt,
        }));

        const analytics = {
            revenue: {
                total: currentRevenue,
                change: Math.round(revenueChange * 10) / 10,
                trend: revenueChange >= 0 ? 'up' : 'down',
            },
            orders: {
                total: currentOrders.length,
                change: Math.round(orderChange * 10) / 10,
                trend: orderChange >= 0 ? 'up' : 'down',
            },
            customers: {
                total: totalCustomers,
                change: Math.round(customerChange * 10) / 10,
                trend: customerChange >= 0 ? 'up' : 'down',
            },
            products: {
                total: totalProducts,
                change: 0,
                trend: 'up',
            },
            campaigns: {
                total: totalCampaigns,
                openRate: Math.round(avgOpenRate * 10) / 10,
                clickRate: Math.round(avgClickRate * 10) / 10,
            },
            topProducts,
            recentOrders: formattedRecentOrders,
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
