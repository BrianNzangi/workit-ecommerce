import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/shipping-methods - Get all shipping methods with zones
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const methods = await prisma.shippingMethod.findMany({
            include: {
                zones: {
                    include: {
                        cities: true,
                    },
                    orderBy: {
                        county: 'asc',
                    },
                },
            },
            orderBy: {
                code: 'asc',
            },
        });

        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error fetching shipping methods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping methods' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/shipping-methods - Update all shipping methods and zones
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { methods } = await request.json();

        // Process each shipping method
        for (const method of methods) {
            // Delete existing zones for this method
            await prisma.shippingZone.deleteMany({
                where: { shippingMethodId: method.id },
            });

            // Create new zones with cities
            if (method.zones && method.zones.length > 0) {
                for (const zone of method.zones) {
                    if (zone.county && zone.county.trim()) {
                        await prisma.shippingZone.create({
                            data: {
                                shippingMethodId: method.id,
                                county: zone.county,
                                cities: {
                                    create: zone.cities
                                        .filter((city: any) => city.cityTown && city.cityTown.trim())
                                        .map((city: any) => ({
                                            cityTown: city.cityTown,
                                            price: Math.round(city.price), // Ensure it's in cents
                                        })),
                                },
                            },
                        });
                    }
                }
            }
        }

        // Fetch updated data
        const updatedMethods = await prisma.shippingMethod.findMany({
            include: {
                zones: {
                    include: {
                        cities: true,
                    },
                    orderBy: {
                        county: 'asc',
                    },
                },
            },
            orderBy: {
                code: 'asc',
            },
        });

        return NextResponse.json(updatedMethods);
    } catch (error) {
        console.error('Error updating shipping methods:', error);
        return NextResponse.json(
            { error: 'Failed to update shipping methods' },
            { status: 500 }
        );
    }
}
