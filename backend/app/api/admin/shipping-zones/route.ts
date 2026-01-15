import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/shipping-zones - Create a new shipping zone
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { shippingMethodId, county, cities } = await request.json();

        // Validation
        if (!shippingMethodId || !county || !cities || cities.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create zone with cities
        const zone = await prisma.shippingZone.create({
            data: {
                shippingMethodId,
                county,
                cities: {
                    create: cities
                        .filter((city: any) => city.cityTown && city.cityTown.trim())
                        .map((city: any) => ({
                            cityTown: city.cityTown,
                            standardPrice: Math.round(city.standardPrice),
                            expressPrice: city.expressPrice ? Math.round(city.expressPrice) : null,
                        })),
                },
            },
            include: {
                cities: true,
            },
        });

        return NextResponse.json(zone, { status: 201 });
    } catch (error) {
        console.error('Error creating shipping zone:', error);
        return NextResponse.json(
            { error: 'Failed to create shipping zone' },
            { status: 500 }
        );
    }
}
