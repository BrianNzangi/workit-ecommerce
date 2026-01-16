import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/shipping-zones/[id] - Update a shipping zone

// PATCH /api/admin/shipping-zones/[id] - Update a shipping zone
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { shippingMethodId, county, cities } = await request.json();
        const zoneId = params.id;

        // Delete existing cities
        await prisma.shippingCity.deleteMany({
            where: { zoneId },
        });

        // Update zone and create new cities
        const zone = await prisma.shippingZone.update({
            where: { id: zoneId },
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

        return NextResponse.json(zone);
    } catch (error) {
        console.error('Error updating shipping zone:', error);
        return NextResponse.json(
            { error: 'Failed to update shipping zone' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/shipping-zones/[id] - Delete a shipping zone
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.shippingZone.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting shipping zone:', error);
        return NextResponse.json(
            { error: 'Failed to delete shipping zone' },
            { status: 500 }
        );
    }
}
