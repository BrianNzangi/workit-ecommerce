import { ShippingMethod } from '../entities/ShippingMethod.js';

/**
 * Repository interface for ShippingMethod entities.
 *
 * Defines the contract for persisting and retrieving ShippingMethod aggregates.
 * Implementations should use Drizzle ORM to interact with the database.
 */
export interface IShippingMethodRepository {
  /**
   * Find a shipping method by ID.
   *
   * @param id - The shipping method ID
   * @returns The ShippingMethod if found, null otherwise
   */
  findById(id: string): Promise<ShippingMethod | null>;

  /**
   * Find a shipping method by code.
   *
   * @param code - The shipping method code
   * @returns The ShippingMethod if found, null otherwise
   */
  findByCode(code: string): Promise<ShippingMethod | null>;

  /**
   * Find all shipping methods.
   *
   * @returns Array of all ShippingMethod entities
   */
  findAll(): Promise<ShippingMethod[]>;

  /**
   * Find all enabled shipping methods.
   *
   * @returns Array of enabled ShippingMethod entities
   */
  findAllEnabled(): Promise<ShippingMethod[]>;

  /**
   * Save a shipping method (create or update).
   *
   * @param method - The ShippingMethod to save
   */
  save(method: ShippingMethod): Promise<void>;

  /**
   * Delete a shipping method by ID.
   *
   * @param id - The shipping method ID
   */
  delete(id: string): Promise<void>;
}
