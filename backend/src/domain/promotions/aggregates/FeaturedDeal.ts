import { AggregateRoot } from '../../shared/AggregateRoot.js';

export type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';
export type DealType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';

export interface FeaturedDealProps {
  productId: string;
  title: string;
  discount: number;
  dealType: DealType;
  startDate: Date;
  endDate: Date;
  status: PromotionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class FeaturedDeal extends AggregateRoot<string> {
  private readonly props: FeaturedDealProps;

  private constructor(id: string, props: FeaturedDealProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    id: string;
    productId: string;
    title: string;
    discount: number;
    dealType: DealType;
    startDate: Date;
    endDate: Date;
    status?: PromotionStatus;
  }): FeaturedDeal {
    if (params.discount < 0 || params.discount > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    if (params.endDate <= params.startDate) {
      throw new Error('End date must be after start date');
    }

    return new FeaturedDeal(params.id, {
      productId: params.productId,
      title: params.title,
      discount: params.discount,
      dealType: params.dealType,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status || 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(params: FeaturedDealProps): FeaturedDeal {
    return new FeaturedDeal(params.productId, params);
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

  get dealType(): DealType {
    return this.props.dealType;
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
    discount?: number;
    dealType?: DealType;
    startDate?: Date;
    endDate?: Date;
  }): void {
    if (params.title) this.props.title = params.title;
    if (params.discount !== undefined) {
      if (params.discount < 0 || params.discount > 100) {
        throw new Error('Discount must be between 0 and 100');
      }
      this.props.discount = params.discount;
    }
    if (params.dealType) this.props.dealType = params.dealType;
    if (params.startDate) this.props.startDate = params.startDate;
    if (params.endDate) this.props.endDate = params.endDate;
    this.props.updatedAt = new Date();
  }
}
