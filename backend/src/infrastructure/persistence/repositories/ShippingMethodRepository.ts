import { eq } from 'drizzle-orm';
import { db, schema } from '@workit/db';
import { IShippingMethodRepository } from '../../../domain/fulfillment/repositories/IShippingMethodRepository.js';
import { ShippingMethod } from '../../../domain/fulfillment/entities/ShippingMethod.js';

type ShippingMethodRecord = typeof schema.shippingMethods.$inferSelect;

/**
 * Repository implementation for ShippingMethod entities.
 *
 * Handles persistence of ShippingMethod aggregates using Drizzle ORM.
 * Maps between domain entities and database records.
 */
export class ShippingMethodRepository implements IShippingMethodRepository {
  /**
   * Find a shipping method by ID.
   */
  async findById(id: string): Promise<ShippingMethod | null> {
    const record = await db.query.shippingMethods.findFirst({
      where: eq(schema.shippingMethods.id, id),
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  /**
   * Find a shipping method by code.
   */
  async findByCode(code: string): Promise<ShippingMethod | null> {
    const record = await db.query.shippingMethods.findFirst({
      where: eq(schema.shippingMethods.code, code),
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  /**
   * Find all shipping methods.
   */
  async findAll(): Promise<ShippingMethod[]> {
    const records = await db.query.shippingMethods.findMany();
    return records.map((record: ShippingMethodRecord) => this.toDomain(record));
  }

  /**
   * Find all enabled shipping methods.
   */
  async findAllEnabled(): Promise<ShippingMethod[]> {
    const records = await db.query.shippingMethods.findMany({
      where: eq(schema.shippingMethods.enabled, true),
    });
    return records.map((record: ShippingMethodRecord) => this.toDomain(record));
  }

  /**
   * Save a shipping method (create or update).
   */
  async save(method: ShippingMethod): Promise<void> {
    const data = this.toPersistence(method);

    // Check if exists
    const existing = await db.query.shippingMethods.findFirst({
      where: eq(schema.shippingMethods.id, method.id),
    });

    if (existing) {
      // Update
      await db
        .update(schema.shippingMethods)
        .set(data)
        .where(eq(schema.shippingMethods.id, method.id));
    } else {
      // Insert
      await db.insert(schema.shippingMethods).values(data);
    }
  }

  /**
   * Delete a shipping method by ID.
   */
  async delete(id: string): Promise<void> {
    await db.delete(schema.shippingMethods).where(eq(schema.shippingMethods.id, id));
  }

  // ─── Mappers ────────────────────────────────────────────────────────────────

  /**
   * Map a database record to a domain ShippingMethod entity.
   */
  private toDomain(record: ShippingMethodRecord): ShippingMethod {
    return ShippingMethod.reconstitute({
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description ?? undefined,
      enabled: record.enabled,
      isExpress: record.isExpress,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Map a domain ShippingMethod entity to a database record.
   */
  private toPersistence(method: ShippingMethod): typeof schema.shippingMethods.$inferInsert {
    return {
      id: method.id,
      code: method.code,
      name: method.name,
      description: method.description,
      enabled: method.enabled,
      isExpress: method.isExpress,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    };
  }
}
