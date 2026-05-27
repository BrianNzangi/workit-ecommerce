import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { ProductSKU } from '../value-objects/ProductSKU.js';
import { Money } from '../../order-management/value-objects/Money.js';
import { ProductStockChanged } from '../events/ProductStockChanged.js';
import { InsufficientStockError } from '../errors/InsufficientStockError.js';

export type ProductCondition = 'NEW' | 'USED' | 'REFURBISHED';

interface ProductProps {
  sku: ProductSKU | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  originalPrice: Money | null;
  salePrice: Money | null;
  stockOnHand: number;
  enabled: boolean;
  condition: ProductCondition;
  brandId: string | null;
  shippingMethodId: string | null;
  vat: number;
  vatInclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Aggregate root for the Catalog bounded context.
 *
 * A Product represents a sellable item in the catalogue. It enforces:
 * - Stock on hand must never go negative
 * - Sale price must not exceed original price
 * - Stock reservations must not exceed available stock
 *
 * Domain events raised:
 * - ProductStockChanged: whenever stockOnHand changes (reserve or release)
 */
export class Product extends AggregateRoot<string> {
  private props: ProductProps;

  private constructor(id: string, props: ProductProps) {
    super(id);
    this.props = props;
    this.validateInvariants();
  }

  /**
   * Create a new Product.
   * Validates all invariants on construction.
   *
   * @throws {Error} if stock is negative
   * @throws {Error} if sale price exceeds original price
   */
  static create(params: {
    id: string;
    sku?: ProductSKU | null;
    name: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    originalPrice?: Money | null;
    salePrice?: Money | null;
    stockOnHand: number;
    enabled?: boolean;
    condition?: ProductCondition;
    brandId?: string | null;
    shippingMethodId?: string | null;
    vat?: number;
    vatInclusive?: boolean;
  }): Product {
    return new Product(params.id, {
      sku: params.sku ?? null,
      name: params.name,
      slug: params.slug,
      description: params.description ?? null,
      shortDescription: params.shortDescription ?? null,
      originalPrice: params.originalPrice ?? null,
      salePrice: params.salePrice ?? null,
      stockOnHand: params.stockOnHand,
      enabled: params.enabled ?? true,
      condition: params.condition ?? 'NEW',
      brandId: params.brandId ?? null,
      shippingMethodId: params.shippingMethodId ?? null,
      vat: params.vat ?? 0,
      vatInclusive: params.vatInclusive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  /**
   * Reconstitute a Product from persisted data (e.g. from the database).
   * Does NOT raise domain events.
   */
  static reconstitute(params: {
    id: string;
    sku: ProductSKU | null;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    originalPrice: Money | null;
    salePrice: Money | null;
    stockOnHand: number;
    enabled: boolean;
    condition: ProductCondition;
    brandId: string | null;
    shippingMethodId: string | null;
    vat: number;
    vatInclusive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Product {
    return new Product(params.id, { ...params });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get sku(): ProductSKU | null {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string | null {
    return this.props.description;
  }

  get shortDescription(): string | null {
    return this.props.shortDescription;
  }

  get originalPrice(): Money | null {
    return this.props.originalPrice;
  }

  get salePrice(): Money | null {
    return this.props.salePrice;
  }

  /**
   * The effective selling price: sale price if set, otherwise original price.
   * Returns null if neither price is set.
   */
  get currentPrice(): Money | null {
    return this.props.salePrice ?? this.props.originalPrice ?? null;
  }

  get stockOnHand(): number {
    return this.props.stockOnHand;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get condition(): ProductCondition {
    return this.props.condition;
  }

  get brandId(): string | null {
    return this.props.brandId;
  }

  get shippingMethodId(): string | null {
    return this.props.shippingMethodId;
  }

  get vat(): number {
    return this.props.vat;
  }

  get vatInclusive(): boolean {
    return this.props.vatInclusive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Reserve (decrement) stock for an order.
   * Raises a ProductStockChanged domain event on success.
   *
   * @throws {Error} if quantity is not a positive integer
   * @throws {InsufficientStockError} if stockOnHand < quantity
   */
  reserveStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Reserve quantity must be a positive integer, got: ${quantity}`);
    }

    if (this.props.stockOnHand < quantity) {
      throw new InsufficientStockError(
        `Insufficient stock for "${this.props.name}". ` +
          `Available: ${this.props.stockOnHand}, Requested: ${quantity}`,
      );
    }

    const previousStock = this.props.stockOnHand;
    this.props.stockOnHand -= quantity;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new ProductStockChanged(this.id, previousStock, this.props.stockOnHand),
    );
  }

  /**
   * Release (increment) stock — e.g. when an order is cancelled.
   * Raises a ProductStockChanged domain event on success.
   *
   * @throws {Error} if quantity is not a positive integer
   */
  releaseStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Release quantity must be a positive integer, got: ${quantity}`);
    }

    const previousStock = this.props.stockOnHand;
    this.props.stockOnHand += quantity;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new ProductStockChanged(this.id, previousStock, this.props.stockOnHand),
    );
  }

  /**
   * Update the product's prices.
   *
   * @throws {Error} if sale price exceeds original price
   */
  updatePrices(originalPrice: Money | null, salePrice: Money | null): void {
    if (originalPrice !== null && salePrice !== null) {
      if (salePrice.amount > originalPrice.amount) {
        throw new Error(
          `Sale price (${salePrice.amount}) cannot exceed original price (${originalPrice.amount})`,
        );
      }
    }
    this.props.originalPrice = originalPrice;
    this.props.salePrice = salePrice;
    this.props.updatedAt = new Date();
  }

  // ─── Invariant Enforcement ───────────────────────────────────────────────────

  private validateInvariants(): void {
    if (this.props.stockOnHand < 0) {
      throw new Error(
        `Product stock cannot be negative, got: ${this.props.stockOnHand}`,
      );
    }

    if (
      this.props.originalPrice !== null &&
      this.props.salePrice !== null &&
      this.props.salePrice.amount > this.props.originalPrice.amount
    ) {
      throw new Error(
        `Sale price (${this.props.salePrice.amount}) cannot exceed ` +
          `original price (${this.props.originalPrice.amount})`,
      );
    }
  }
}
