import { FlashSale, FlashSaleProduct } from '../../../domain/promotions/aggregates/FlashSale.js';
import { db, schema } from '@workit/db';

export interface FlashSaleRecord {
  id: string;
  title: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashSaleProductRecord {
  id: string;
  flashSaleId: string;
  productId: string;
}

export interface FlashSaleWithProducts extends FlashSaleRecord {
  products: FlashSaleProductRecord[];
}

export class FlashSaleMapper {
  toDomain(raw: FlashSaleWithProducts): FlashSale {
    const products = raw.products.map((p) =>
      FlashSaleProduct.create({
        id: p.id,
        flashSaleId: p.flashSaleId,
        productId: p.productId,
      })
    );

    return FlashSale.create({
      id: raw.id,
      title: raw.title,
      discount: raw.discount,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status as any,
      products,
    });
  }

  toPersistence(flashSale: FlashSale): FlashSaleRecord {
    return {
      id: flashSale.id,
      title: flashSale.title,
      discount: flashSale.discount,
      startDate: flashSale.startDate,
      endDate: flashSale.endDate,
      status: flashSale.status,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
    };
  }

  toProductPersistence(flashSale: FlashSale): FlashSaleProductRecord[] {
    return flashSale.productIds.map((productId) => ({
      id: crypto.randomUUID(),
      flashSaleId: flashSale.id,
      productId,
    }));
  }
}
