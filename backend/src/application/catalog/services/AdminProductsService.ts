import { v4 as uuidv4 } from "uuid";
import { db, schema, eq, inArray, desc } from "@workit/db";
import {
  IProductRepository,
  ProductSearchParams,
} from "../../../domain/catalog/repositories/IProductRepository.js";
import { Product, ProductCondition } from "../../../domain/catalog/entities/Product.js";
import { ProductSKU } from "../../../domain/catalog/value-objects/ProductSKU.js";
import { Money } from "../../../domain/order-management/value-objects/Money.js";

export interface AdminListRequest {
  limit?: number;
  offset?: number;
  collectionId?: string;
  brandId?: string;
  enabled?: string;
  q?: string;
  condition?: string;
  stockStatus?: string;
  minPrice?: string;
  maxPrice?: string;
  includeTotalAll?: string;
}

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  stockOnHand: number;
  enabled: boolean;
  condition: string;
  brandId: string | null;
  shippingMethodId: string | null;
  vat: number;
  vatInclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  brand: any | null;
  assets: any[];
  collections: any[];
  homepageCollections: any[];
  campaignProducts: any[];
}

export interface CreateProductInput {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  salePrice?: number;
  originalPrice?: number;
  stockOnHand: number;
  enabled?: boolean;
  condition?: string;
  brandId?: string;
  shippingMethodId?: string;
  vat?: number;
  vatInclusive?: boolean;
  collections?: string[];
  assetIds?: string[];
  homepageCollections?: string[];
}

export class AdminProductsService {
  constructor(private readonly productRepository: IProductRepository) {}

  async list(params: AdminListRequest) {
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 200);
    const offset = Math.max(Number(params.offset) || 0, 0);

    const searchParams: ProductSearchParams = {
      limit,
      offset,
      enabledOnly: params.enabled !== undefined ? undefined : true,
    };

    if (params.enabled !== undefined) {
      searchParams.enabledOnly = params.enabled === "true";
    }

    if (params.brandId) searchParams.brandId = params.brandId;
    if (params.collectionId) searchParams.collectionId = params.collectionId;
    if (params.condition) searchParams.condition = params.condition;
    if (params.stockStatus) searchParams.stockStatus = params.stockStatus as any;
    if (params.minPrice) searchParams.minPrice = Number(params.minPrice);
    if (params.maxPrice) searchParams.maxPrice = Number(params.maxPrice);
    if (params.q) searchParams.query = params.q;

    const result = await this.productRepository.search(searchParams);

    let totalAll: number | undefined;
    if (params.includeTotalAll === "true") {
      totalAll = await this.productRepository.countAll();
    }

    const products = await this.enrichWithRelations(result.products);

    return {
      products,
      success: true,
      total: result.total,
      totalAll,
      limit,
      offset,
    };
  }

  async getById(id: string) {
    const product = await this.productRepository.findByIdentifier(id);
    if (!product) return null;

    const [enriched] = await this.enrichWithRelations([product]);
    return { product: enriched, success: true };
  }

  async create(input: CreateProductInput) {
    const id = uuidv4();

    const existing = await this.productRepository.findByIdentifier(input.slug);
    if (existing) {
      throw Object.assign(new Error("Product with this slug already exists"), { statusCode: 400 });
    }

    const product = Product.create({
      id,
      name: input.name,
      slug: input.slug,
      sku: input.sku ? ProductSKU.create(input.sku) : null,
      description: input.description,
      shortDescription: input.shortDescription,
      originalPrice: input.originalPrice != null ? Money.create(input.originalPrice, "KES") : null,
      salePrice: input.salePrice != null ? Money.create(input.salePrice, "KES") : null,
      stockOnHand: input.stockOnHand,
      enabled: input.enabled ?? true,
      condition: (input.condition ?? "NEW") as ProductCondition,
      brandId: input.brandId ?? null,
      shippingMethodId: input.shippingMethodId ?? null,
      vat: input.vat ?? 0,
      vatInclusive: input.vatInclusive ?? true,
    });

    await this.productRepository.save(product);

    if (input.collections?.length) {
      await db.insert(schema.productCollections as any).values(
        input.collections.map((cid: string) => ({
          id: uuidv4(),
          productId: id,
          collectionId: cid,
        })),
      );
    }

    if (input.assetIds?.length) {
      await db.insert(schema.productAssets as any).values(
        input.assetIds.map((aid: string, i: number) => ({
          id: uuidv4(),
          productId: id,
          assetId: aid,
          sortOrder: i,
        })),
      );
    }

    if (input.homepageCollections?.length) {
      await db.insert(schema.homepageCollectionProducts as any).values(
        input.homepageCollections.map((hcid: string, i: number) => ({
          id: uuidv4(),
          productId: id,
          collectionId: hcid,
          sortOrder: i,
        })),
      );
    }

    return { product: { ...product }, success: true };
  }

  async update(id: string, input: any) {
    const existing = await this.productRepository.findByIdentifier(id);
    if (!existing) {
      throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    }

    const resolvedId = existing.id;

    const updateData: any = { updatedAt: new Date() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.shortDescription !== undefined) updateData.shortDescription = input.shortDescription;
    if (input.salePrice !== undefined) updateData.salePrice = input.salePrice;
    if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
    if (input.stockOnHand !== undefined) updateData.stockOnHand = input.stockOnHand;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.condition !== undefined) updateData.condition = input.condition;
    if (input.brandId !== undefined) updateData.brandId = input.brandId;
    if (input.shippingMethodId !== undefined) updateData.shippingMethodId = input.shippingMethodId;
    if (input.vat !== undefined) updateData.vat = input.vat;
    if (input.vatInclusive !== undefined) updateData.vatInclusive = input.vatInclusive;

    await db
      .update(schema.products as any)
      .set(updateData)
      .where(eq(schema.products.id as any, resolvedId));

    if (input.collections !== undefined) {
      await db
        .delete(schema.productCollections as any)
        .where(eq(schema.productCollections.productId as any, resolvedId));
      if (input.collections.length > 0) {
        await db.insert(schema.productCollections as any).values(
          input.collections.map((cid: string) => ({
            id: uuidv4(),
            productId: resolvedId,
            collectionId: cid,
          })),
        );
      }
    }

    if (input.assetIds !== undefined) {
      await db
        .delete(schema.productAssets as any)
        .where(eq(schema.productAssets.productId as any, resolvedId));
      if (input.assetIds.length > 0) {
        await db.insert(schema.productAssets as any).values(
          input.assetIds.map((aid: string, i: number) => ({
            id: uuidv4(),
            productId: resolvedId,
            assetId: aid,
            sortOrder: i,
          })),
        );
      }
    }

    if (input.homepageCollections !== undefined) {
      await db
        .delete(schema.homepageCollectionProducts as any)
        .where(eq(schema.homepageCollectionProducts.productId as any, resolvedId));
      if (input.homepageCollections.length > 0) {
        await db.insert(schema.homepageCollectionProducts as any).values(
          input.homepageCollections.map((hcid: string, i: number) => ({
            id: uuidv4(),
            productId: resolvedId,
            collectionId: hcid,
            sortOrder: i,
          })),
        );
      }
    }

    return { success: true };
  }

  async softDelete(id: string) {
    const product = await this.productRepository.findByIdentifier(id);
    if (!product) {
      throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    }
    await this.productRepository.softDelete(product.id);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw Object.assign(new Error("No IDs provided"), { statusCode: 400 });
    }
    for (const id of ids) {
      await this.productRepository.softDelete(id);
    }
    return { success: true, count: ids.length };
  }

  async importProducts(products: any[]) {
    if (!Array.isArray(products) || products.length === 0) {
      throw Object.assign(new Error("No data provided"), { statusCode: 400 });
    }

    const allBrands = await (db as any).query.brands.findMany();
    const brandBySlug = new Map(allBrands.map((b: any) => [b.slug, b.id]));

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      try {
        if (!row.name || !row.slug) {
          errors.push(`Item ${i + 1}: Missing required fields (name, slug)`);
          skipped++;
          continue;
        }

        const productData: any = {
          name: row.name,
          slug: row.slug,
          sku: row.sku || null,
          enabled: false,
          condition: row.condition || "NEW",
        };

        if (row.brandSlug && brandBySlug.has(row.brandSlug)) {
          productData.brandId = brandBySlug.get(row.brandSlug);
        }

        const existing = await this.productRepository.findByIdentifier(row.slug);

        if (existing) {
          await db
            .update(schema.products as any)
            .set({ ...productData, updatedAt: new Date() })
            .where(eq(schema.products.id as any, existing.id));
          updated++;
        } else {
          const productId = uuidv4();
          await db
            .insert(schema.products as any)
            .values({ ...productData, id: productId });
          created++;
        }
      } catch (err: any) {
        errors.push(`Item ${i + 1} (${row.name || "unknown"}): ${err.message}`);
        skipped++;
      }
    }

    return {
      success: true,
      created,
      updated,
      skipped,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async exportCSV() {
    const allProducts: any[] = await (db as any).query.products.findMany({
      orderBy: [desc(schema.products.createdAt as any)],
      with: {
        collections: { with: { collection: true } },
        brand: true,
      },
    });

    const headers = [
      "name", "slug", "sku", "description", "salePrice", "originalPrice",
      "stockOnHand", "enabled", "condition", "brandSlug", "collections", "vat", "vatInclusive",
    ];

    const escapeCSV = (val: any) => {
      const str = val === null || val === undefined ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = allProducts.map((p: any) =>
      [
        escapeCSV(p.name),
        escapeCSV(p.slug),
        escapeCSV(p.sku),
        escapeCSV(p.description),
        escapeCSV(p.salePrice),
        escapeCSV(p.originalPrice),
        escapeCSV(p.stockOnHand),
        escapeCSV(p.enabled),
        escapeCSV(p.condition),
        escapeCSV(p.brand?.slug || ""),
        escapeCSV(
          (p.collections || [])
            .map((pc: any) => pc.collection?.slug)
            .filter(Boolean)
            .join("|"),
        ),
        escapeCSV(p.vat),
        escapeCSV(p.vatInclusive),
      ].join(","),
    );

    return headers.join(",") + "\n" + rows.join("\n") + "\n";
  }

  private async enrichWithRelations(products: Product[]): Promise<AdminProductRow[]> {
    if (products.length === 0) return [];

    const ids = products.map((p) => p.id);

    const [brands, assets, collections, homepageCollections, campaignProducts] = await Promise.all([
      db.query.brands.findMany({ where: inArray(schema.brands.id as any, ids) }),
      db.query.productAssets.findMany({
        where: inArray(schema.productAssets.productId as any, ids),
        with: { asset: true },
      }),
      db.query.productCollections.findMany({
        where: inArray(schema.productCollections.productId as any, ids),
        with: { collection: true },
      }),
      db.query.homepageCollectionProducts.findMany({
        where: inArray(schema.homepageCollectionProducts.productId as any, ids),
        with: { collection: true },
      }),
      db.query.campaignProducts.findMany({
        where: inArray(schema.campaignProducts.productId as any, ids),
        with: { campaign: true },
      }),
    ]);

    const brandMap = new Map(brands.map((b: any) => [b.id, b]));

    return products.map((product) => {
      const base: any = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku?.value ?? null,
        description: product.description,
        shortDescription: product.shortDescription,
        salePrice: product.salePrice?.amount ?? null,
        originalPrice: product.originalPrice?.amount ?? null,
        stockOnHand: product.stockOnHand,
        enabled: product.enabled,
        condition: product.condition,
        brandId: product.brandId,
        shippingMethodId: product.shippingMethodId,
        vat: product.vat,
        vatInclusive: product.vatInclusive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: null,
        brand: product.brandId ? brandMap.get(product.brandId) ?? null : null,
        assets: assets.filter((a: any) => a.productId === product.id),
        collections: collections.filter((c: any) => c.productId === product.id),
        homepageCollections: homepageCollections.filter((h: any) => h.productId === product.id),
        campaignProducts: campaignProducts.filter((c: any) => c.productId === product.id),
      };
      return base as AdminProductRow;
    });
  }
}
