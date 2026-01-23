import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class ShippingService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async findAllMethods() {
        const methods = await this.db.select().from(schema.shippingMethods);

        // Enrich with zones and cities
        const enrichedMethods = await Promise.all(
            methods.map(async (method) => {
                const zones = await this.db.select().from(schema.shippingZones).where(eq(schema.shippingZones.shippingMethodId, method.id));
                const zonesWithCities = await Promise.all(
                    zones.map(async (zone) => {
                        const cities = await this.db.select().from(schema.shippingCities).where(eq(schema.shippingCities.zoneId, zone.id));
                        return { ...zone, cities };
                    })
                );
                return { ...method, zones: zonesWithCities };
            })
        );

        return enrichedMethods;
    }

    async createZone(input: any) {
        return await this.db.transaction(async (tx) => {
            const [zone] = await tx.insert(schema.shippingZones).values({
                shippingMethodId: input.shippingMethodId,
                county: input.county,
            }).returning();

            if (input.cities && input.cities.length > 0) {
                await tx.insert(schema.shippingCities).values(
                    input.cities.map((city: any) => ({
                        zoneId: zone.id,
                        cityTown: city.cityTown,
                        standardPrice: city.standardPrice,
                        expressPrice: city.expressPrice,
                    }))
                );
            }

            return zone;
        });
    }

    async updateZone(id: string, input: any) {
        return await this.db.transaction(async (tx) => {
            const [zone] = await tx.update(schema.shippingZones)
                .set({
                    shippingMethodId: input.shippingMethodId,
                    county: input.county,
                    updatedAt: new Date(),
                })
                .where(eq(schema.shippingZones.id, id))
                .returning();

            if (!zone) throw new NotFoundException('Shipping zone not found');

            // Replace cities
            await tx.delete(schema.shippingCities).where(eq(schema.shippingCities.zoneId, id));

            if (input.cities && input.cities.length > 0) {
                await tx.insert(schema.shippingCities).values(
                    input.cities.map((city: any) => ({
                        zoneId: id,
                        cityTown: city.cityTown,
                        standardPrice: city.standardPrice,
                        expressPrice: city.expressPrice,
                    }))
                );
            }

            return zone;
        });
    }

    async deleteZone(id: string) {
        const [zone] = await this.db.delete(schema.shippingZones)
            .where(eq(schema.shippingZones.id, id))
            .returning();

        if (!zone) throw new NotFoundException('Shipping zone not found');
        return { success: true };
    }
}
