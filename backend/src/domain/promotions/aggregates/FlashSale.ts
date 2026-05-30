import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Entity } from '../../shared/Entity.js';
import type { PromotionStatus } from './types.js';

export interface FlashSaleProductProps {
  id: string;
  flashSaleId: string;
  productId: string;
}

export class FlashSaleProduct extends Entity<string> {
  private readonly props: FlashSaleProductProps;

  private constructor(id: string, props: FlashSaleProductProps) {
    super(id);
    this.props = props;
  }

  static create(params: { id: string; flashSaleId: string; productId: string }): FlashSaleProduct {
    return new FlashSaleProduct(params.id, {
      id: params.id,
      flashSaleId: params.flashSaleId,
      productId: params.productId,
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  getFlashSaleId(): string {
    return this.props.flashSaleId;
  }
}

export interface FlashSaleProps {
  title: string;
  discount: number;
  campaignId?: string;
  startDate: Date;
  endDate: Date;
  status: PromotionStatus;
  products: FlashSaleProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export class FlashSale extends AggregateRoot<string> {
  private readonly props: FlashSaleProps;

  private constructor(id: string, props: FlashSaleProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    id: string;
    title: string;
    discount: number;
    campaignId?: string;
    startDate: Date;
    endDate: Date;
    status?: PromotionStatus;
    products?: FlashSaleProduct[];
  }): FlashSale {
    if (params.discount < 0 || params.discount > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    if (params.endDate <= params.startDate) {
      throw new Error('End date must be after start date');
    }

    return new FlashSale(params.id, {
      title: params.title,
      discount: params.discount,
      campaignId: params.campaignId,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status || 'DRAFT',
      products: params.products || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(params: FlashSaleProps): FlashSale {
    return new FlashSale(params.title, params);
  }

  get title(): string {
    return this.props.title;
  }

  get discount(): number {
    return this.props.discount;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get status(): PromotionStatus {
    return this.props.status;
  }

  get products(): ReadonlyArray<FlashSaleProduct> {
    return this.props.products;
  }

  get productIds(): string[] {
    return this.props.products.map((p) => p.productId);
  }

  get productsCount(): number {
    return this.props.products.length;
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

  get campaignId(): string | undefined {
    return this.props.campaignId;
  }

  updateDetails(params: {
    title?: string;
    discount?: number;
    campaignId?: string;
    startDate?: Date;
    endDate?: Date;
  }): void {
    if (params.title) this.props.title = params.title;
    if (params.campaignId !== undefined) this.props.campaignId = params.campaignId;
    if (params.discount !== undefined) {
      if (params.discount < 0 || params.discount > 100) {
        throw new Error('Discount must be between 0 and 100');
      }
      this.props.discount = params.discount;
    }
    if (params.startDate) this.props.startDate = params.startDate;
    if (params.endDate) this.props.endDate = params.endDate;
    this.props.updatedAt = new Date();
  }

  addProduct(productId: string): void {
    if (this.props.products.some((p) => p.productId === productId)) {
      return;
    }
    const product = FlashSaleProduct.create({
      id: crypto.randomUUID(),
      flashSaleId: this.id,
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
      FlashSaleProduct.create({
        id: crypto.randomUUID(),
        flashSaleId: this.id,
        productId,
      })
    );
    this.props.updatedAt = new Date();
  }
}
