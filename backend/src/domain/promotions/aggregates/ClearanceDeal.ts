import { AggregateRoot } from '../../shared/AggregateRoot.js';
import type { PromotionStatus, ClearanceDealSource } from './types.js';

export interface ClearanceDealProps {
  productId: string;
  title: string;
  discount: number;
  type: string;
  deal: ClearanceDealSource;
  startDate: Date;
  endDate: Date;
  status: PromotionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ClearanceDeal extends AggregateRoot<string> {
  private readonly props: ClearanceDealProps;

  private constructor(id: string, props: ClearanceDealProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    id: string;
    productId: string;
    title: string;
    discount: number;
    type?: string;
    deal: ClearanceDealSource;
    startDate: Date;
    endDate: Date;
    status?: PromotionStatus;
  }): ClearanceDeal {
    if (params.discount < 0 || params.discount > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    if (params.endDate <= params.startDate) {
      throw new Error('End date must be after start date');
    }

    return new ClearanceDeal(params.id, {
      productId: params.productId,
      title: params.title,
      discount: params.discount,
      type: params.type || 'Promo',
      deal: params.deal,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status || 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(params: ClearanceDealProps): ClearanceDeal {
    return new ClearanceDeal(params.productId, params);
  }

  get productId(): string {
    return this.props.productId;
  }

  get title(): string {
    return this.props.title;
  }

  get discount(): number {
    return this.props.discount;
  }

  get type(): string {
    return this.props.type;
  }

  get deal(): ClearanceDealSource {
    return this.props.deal;
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
    productId?: string;
    discount?: number;
    type?: string;
    deal?: ClearanceDealSource;
    startDate?: Date;
    endDate?: Date;
  }): void {
    if (params.title) this.props.title = params.title;
    if (params.productId) this.props.productId = params.productId;
    if (params.discount !== undefined) {
      if (params.discount < 0 || params.discount > 100) {
        throw new Error('Discount must be between 0 and 100');
      }
      this.props.discount = params.discount;
    }
    if (params.type) this.props.type = params.type;
    if (params.deal) this.props.deal = params.deal;
    if (params.startDate) this.props.startDate = params.startDate;
    if (params.endDate) this.props.endDate = params.endDate;
    this.props.updatedAt = new Date();
  }
}
