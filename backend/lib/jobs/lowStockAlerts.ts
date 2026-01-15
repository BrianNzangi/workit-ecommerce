import { prisma } from '@/lib/prisma';

/**
 * Check for low stock items and generate alerts
 */
export async function checkLowStock() {
    try {
        const LOW_STOCK_THRESHOLD = 5;

        // Find variants with low stock
        const lowStockVariants = await prisma.productVariant.findMany({
            where: {
                stockOnHand: {
                    lt: LOW_STOCK_THRESHOLD,
                },
                enabled: true,
            },
            include: {
                product: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (lowStockVariants.length === 0) {
            return {
                success: true,
                message: 'No low stock items',
                count: 0,
            };
        }

        // Group by product
        const productGroups = lowStockVariants.reduce((acc, variant) => {
            const productName = variant.product.name;
            if (!acc[productName]) {
                acc[productName] = [];
            }
            acc[productName].push({
                variant: variant.name,
                sku: variant.sku,
                stock: variant.stockOnHand,
            });
            return acc;
        }, {} as Record<string, any[]>);

        // Log alerts (can be extended to send email)
        console.log('⚠️ LOW STOCK ALERT:');
        Object.entries(productGroups).forEach(([product, variants]) => {
            console.log(`  ${product}:`);
            variants.forEach((v) => {
                console.log(`    - ${v.variant} (${v.sku}): ${v.stock} units remaining`);
            });
        });

        return {
            success: true,
            message: `Found ${lowStockVariants.length} low stock item${lowStockVariants.length !== 1 ? 's' : ''}`,
            count: lowStockVariants.length,
            items: productGroups,
        };
    } catch (error) {
        console.error('Error checking low stock:', error);
        return {
            success: false,
            message: 'Failed to check stock levels',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
