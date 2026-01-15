import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const county = searchParams.get('county');
        const city = searchParams.get('city');

        // Fetch all shipping methods with their zones
        const shippingMethods = await prisma.shippingMethod.findMany({
            where: {
                enabled: true,
            },
            include: {
                zones: {
                    include: {
                        cities: true,
                    },
                },
            },
            orderBy: {
                code: 'asc',
            },
        });

        // If county and city are provided, filter for specific location
        if (county && city) {
            const availableMethods: any[] = [];

            shippingMethods.forEach(method => {
                const zone = method.zones.find(z =>
                    z.county.toLowerCase() === county.toLowerCase()
                );

                if (!zone) return;

                const cityData = zone.cities.find(c =>
                    c.cityTown.toLowerCase() === city.toLowerCase()
                );

                if (!cityData) return;

                // Add standard shipping option
                availableMethods.push({
                    id: `${method.id}-standard`,
                    code: `${method.code}-standard`,
                    name: `${method.name} - Standard`,
                    description: method.description,
                    isExpress: false,
                    price: cityData.standardPrice / 100, // Convert from cents to KES
                    county: zone.county,
                    city: cityData.cityTown,
                });

                // Add express shipping option if available
                if (cityData.expressPrice) {
                    availableMethods.push({
                        id: `${method.id}-express`,
                        code: `${method.code}-express`,
                        name: `${method.name} - Express`,
                        description: method.description,
                        isExpress: true,
                        price: cityData.expressPrice / 100, // Convert from cents to KES
                        county: zone.county,
                        city: cityData.cityTown,
                    });
                }
            });

            return NextResponse.json({
                success: true,
                data: availableMethods,
            });
        }

        // Return all zones grouped by method
        const formattedData = shippingMethods.map(method => ({
            id: method.id,
            code: method.code,
            name: method.name,
            description: method.description,
            isExpress: method.isExpress,
            zones: method.zones.map(zone => ({
                id: zone.id,
                county: zone.county,
                cities: zone.cities.map(city => ({
                    id: city.id,
                    cityTown: city.cityTown,
                    standardPrice: city.standardPrice / 100, // Convert from cents to KES
                    expressPrice: city.expressPrice ? city.expressPrice / 100 : null, // Convert from cents to KES
                })),
            })),
        }));

        return NextResponse.json({
            success: true,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error fetching shipping zones:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch shipping zones',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : {},
                },
            },
            { status: 500 }
        );
    }
}
