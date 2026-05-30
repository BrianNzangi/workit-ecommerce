import { Entity } from '../../shared/Entity.js';

export class Banner extends Entity<string> {
  private readonly _title: string;
  private readonly _description: string | null;
  private readonly _slug: string;
  private readonly _position: string;
  private readonly _enabled: boolean;
  private readonly _sortOrder: number;
  private readonly _desktopImageId: string | null;
  private readonly _mobileImageId: string | null;
  private readonly _collectionId: string | null;
  private readonly _productId: string | null;
  private readonly _campaignId: string | null;
  private readonly _promotionId: string | null;
  private _updatedAt: Date;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    title: string,
    description: string | null,
    slug: string,
    position: string,
    enabled: boolean,
    sortOrder: number,
    desktopImageId: string | null,
    mobileImageId: string | null,
    collectionId: string | null,
    productId: string | null,
    campaignId: string | null,
    promotionId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id);
    this._title = title;
    this._description = description;
    this._slug = slug;
    this._position = position;
    this._enabled = enabled;
    this._sortOrder = sortOrder;
    this._desktopImageId = desktopImageId;
    this._mobileImageId = mobileImageId;
    this._collectionId = collectionId;
    this._productId = productId;
    this._campaignId = campaignId;
    this._promotionId = promotionId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    title: string;
    description?: string | null;
    slug: string;
    position: string;
    enabled?: boolean;
    sortOrder?: number;
    desktopImageId?: string | null;
    mobileImageId?: string | null;
    collectionId?: string | null;
    productId?: string | null;
    campaignId?: string | null;
    promotionId?: string | null;
  }): Banner {
    const now = new Date();
    return new Banner(
      params.id,
      params.title,
      params.description ?? null,
      params.slug,
      params.position,
      params.enabled ?? true,
      params.sortOrder ?? 0,
      params.desktopImageId ?? null,
      params.mobileImageId ?? null,
      params.collectionId ?? null,
      params.productId ?? null,
      params.campaignId ?? null,
      params.promotionId ?? null,
      now,
      now,
    );
  }

  static reconstitute(params: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    position: string;
    enabled: boolean;
    sortOrder: number;
    desktopImageId: string | null;
    mobileImageId: string | null;
    collectionId: string | null;
    productId: string | null;
    campaignId: string | null;
    promotionId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Banner {
    return new Banner(
      params.id,
      params.title,
      params.description,
      params.slug,
      params.position,
      params.enabled,
      params.sortOrder,
      params.desktopImageId,
      params.mobileImageId,
      params.collectionId,
      params.productId,
      params.campaignId,
      params.promotionId,
      params.createdAt,
      params.updatedAt,
    );
  }

  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get slug(): string { return this._slug; }
  get position(): string { return this._position; }
  get enabled(): boolean { return this._enabled; }
  get sortOrder(): number { return this._sortOrder; }
  get desktopImageId(): string | null { return this._desktopImageId; }
  get mobileImageId(): string | null { return this._mobileImageId; }
  get collectionId(): string | null { return this._collectionId; }
  get productId(): string | null { return this._productId; }
  get campaignId(): string | null { return this._campaignId; }
  get promotionId(): string | null { return this._promotionId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
