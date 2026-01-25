import { StoreService } from './store.service';
export declare class StoreController {
    private storeService;
    constructor(storeService: StoreService);
    getCollections(parentId?: string, featured?: string): Promise<{
        children: {
            id: string;
            name: string;
            slug: string;
            enabled: boolean;
            assetId: string | null;
            showInMostShopped: boolean;
            asset: {
                id: string;
                source: string;
                preview: string;
            } | null;
        }[];
        id: string;
        name: string;
        enabled: boolean;
        slug: string;
        description: string | null;
        assetId: string | null;
        parentId: string | null;
        sortOrder: number;
        showInMostShopped: boolean;
        asset: {
            id: string;
            source: string;
            preview: string;
        } | null;
    }[]>;
    getProducts(collectionId?: string, collection?: string, search?: string, minPrice?: string, maxPrice?: string, limit?: string, offset?: string, page?: string): Promise<{
        data: {
            products: {
                featuredImage: string | null;
                inStock: boolean;
                brand: any;
                id: string;
                name: string;
                slug: string;
                description: string | null;
                salePrice: number | null;
                originalPrice: number | null;
                stockOnHand: number;
                brandId: string | null;
                createdAt: Date;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    searchProducts(query: string): Promise<{
        featuredImage: string | null;
        id: string;
        name: string;
        slug: string;
        salePrice: number | null;
    }[]>;
    getProduct(id: string): Promise<{
        success: boolean;
        data: {
            images: {
                id: string;
                source: string;
                preview: string;
                sortOrder: number;
                featured: boolean;
            }[];
            collections: {
                id: string;
                name: string;
                slug: string;
            }[];
            brand: any;
            id: string;
            name: string;
            slug: string;
            sku: string | null;
            description: string | null;
            salePrice: number | null;
            originalPrice: number | null;
            stockOnHand: number;
            enabled: boolean;
            condition: "NEW" | "REFURBISHED";
            brandId: string | null;
            shippingMethodId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    getShippingMethods(): Promise<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        enabled: boolean;
        isExpress: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getShippingZones(): Promise<{
        cities: {
            id: string;
            zoneId: string;
            cityTown: string;
            standardPrice: number;
            expressPrice: number | null;
        }[];
        method: {
            id: string;
            code: string;
            name: string;
            description: string | null;
            enabled: boolean;
            isExpress: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        shippingMethodId: string;
        county: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBanners(): Promise<{
        desktopImage: any;
        mobileImage: any;
        collection: any;
        id: string;
        title: string;
        description: string | null;
        slug: string;
        position: "HERO" | "DEALS" | "DEALS_HORIZONTAL" | "MIDDLE" | "BOTTOM" | "COLLECTION_TOP";
        enabled: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        desktopImageId: string | null;
        mobileImageId: string | null;
        collectionId: string | null;
    }[]>;
    getHomepageCollections(): Promise<{
        products: {
            featuredImage: string | null;
            inStock: boolean;
            id: string;
            name: string;
            slug: string;
            description: string | null;
            salePrice: number | null;
            originalPrice: number | null;
            stockOnHand: number;
            brandId: string | null;
        }[];
        id: string;
        title: string;
        slug: string;
        enabled: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCampaigns(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        type: "SEASONAL" | "PROMOTIONAL" | "PRODUCT_LAUNCH" | "HOLIDAY" | "LOYALTY" | "RE_ENGAGEMENT" | "OTHER";
        status: "CANCELLED" | "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED" | "PAUSED";
        startDate: Date;
        endDate: Date | null;
        targetAudience: string | null;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y" | "NONE" | null;
        discountValue: number | null;
        couponCode: string | null;
        minPurchaseAmount: number | null;
        maxDiscountAmount: number | null;
        usageLimit: number | null;
        usagePerCustomer: number | null;
        brevoEmailCampaignId: number | null;
        brevoListId: number | null;
        emailsSent: number | null;
        emailsOpened: number | null;
        emailsClicked: number | null;
        conversions: number | null;
        revenue: number | null;
        bannerIds: string | null;
        collectionIds: string | null;
        productIds: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }[]>;
    getPolicies(): Promise<any>;
    validateCart(body: {
        items: any[];
    }): Promise<{
        valid: boolean;
        results: any[];
        invalidItems: any[];
    }>;
}
