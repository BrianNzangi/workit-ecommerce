import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Entity } from '../../shared/Entity.js';
import { Money } from '../../order-management/value-objects/Money.js';

export type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';
export type DealType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';
export type ClearanceDealSource = 'FLASH_SALE' | 'FEATURED_DEAL';

export interface CouponProductProps {
  id: string;
  couponId: string;
  productId: string;
}

export class CouponProduct extends Entity<string> {
  private readonly props: CouponProductProps;

  private constructor(id: string, props: CouponProductProps) {
    super(id);
    this.props = props;
  }

  static create(params: { id: string; couponId: string; productId: string }): CouponProduct {
    return new CouponProduct(params.id, {
      id: params.id,
      couponId: params.couponId,
      productId: params.productId,
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  getCouponId(): string {
    return this.props.couponId;
  }
}

export interface CouponProps {
  id?: string;
  title: string;
  code?: string;
  bannerImageId?: string;
  couponAmount: Money;
  minAmount: Money;
  userLimit: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  status: PromotionStatus;
  products: CouponProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export class Coupon extends AggregateRoot<string> {
  private readonly props: CouponProps;

  private constructor(id: string, props: CouponProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    id: string;
    title: string;
    code?: string;
    bannerImageId?: string;
    couponAmount: Money;
    minAmount: Money;
    userLimit: number;
    startDate: Date;
    endDate: Date;
    description?: string;
    status?: PromotionStatus;
    products?: CouponProduct[];
  }): Coupon {
    if (params.endDate <= params.startDate) {
      throw new Error('End date must be after start date');
    }
    if (params.couponAmount.amount < 0) {
      throw new Error('Coupon amount must be non-negative');
    }
    if (params.minAmount.amount < 0) {
      throw new Error('Minimum amount must be non-negative');
    }

    return new Coupon(params.id, {
      title: params.title,
      code: params.code,
      bannerImageId: params.bannerImageId,
      couponAmount: params.couponAmount,
      minAmount: params.minAmount,
      userLimit: params.userLimit,
      startDate: params.startDate,
      endDate: params.endDate,
      description: params.description,
      status: params.status || 'DRAFT',
      products: params.products || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(params: CouponProps): Coupon {
    return new Coupon(params.id || crypto.randomUUID(), params);
  }

  get title(): string {
    return this.props.title;
  }

  get code(): string | undefined {
    return this.props.code;
  }

  get bannerImageId(): string | undefined {
    return this.props.bannerImageId;
  }

  get couponAmount(): Money {
    return this.props.couponAmount;
  }

  get minAmount(): Money {
    return this.props.minAmount;
  }

  get userLimit(): number {
    return this.props.userLimit;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): PromotionStatus {
    return this.props.status;
  }

  get products(): ReadonlyArray<CouponProduct> {
    return this.props.products;
  }

  get productIds(): string[] {
    return this.props.products.map((p) => p.productId);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.endDate;
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE' && !this.isExpired();
  }

  updateStatus(status: PromotionStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  updateDetails(params: {
    title?: string;
    bannerImageId?: string;
    couponAmount?: Money;
    minAmount?: Money;
    userLimit?: number;
    startDate?: Date;
    endDate?: Date;
    description?: string;
  }): void {
    if (params.title) this.props.title = params.title;
    if (params.bannerImageId !== undefined) this.props.bannerImageId = params.bannerImageId;
    if (params.couponAmount) this.props.couponAmount = params.couponAmount;
    if (params.minAmount) this.props.minAmount = params.minAmount;
    if (params.userLimit !== undefined) this.props.userLimit = params.userLimit;
    if (params.startDate) this.props.startDate = params.startDate;
    if (params.endDate) this.props.endDate = params.endDate;
    if (params.description !== undefined) this.props.description = params.description;
    this.props.updatedAt = new Date();
  }

  addProduct(productId: string): void {
    if (this.props.products.some((p) => p.productId === productId)) {
      return;
    }
    const product = CouponProduct.create({
      id: crypto.randomUUID(),
      couponId: this.id,
      productId,
    });
    this.props.products.push(product);
    this.props.updatedAt = new Date();
  }

  removeProduct(productId: string): void {
    this.props.products = this.props.products.filter((p) => p.productId !== productId);
    this.props.updatedAt = new Date();
  }

  setProducts(productIds: string[]): void {
    this.props.products = productIds.map((productId) =>
      CouponProduct.create({
        id: crypto.randomUUID(),
        couponId: this.id,
        productId,
      })
    );
    this.props.updatedAt = new Date();
  }
}
