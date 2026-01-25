import { BannersService } from './banners.service';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
        position: "HERO" | "DEALS" | "DEALS_HORIZONTAL" | "MIDDLE" | "BOTTOM" | "COLLECTION_TOP";
        desktopImageId: string | null;
        mobileImageId: string | null;
        collectionId: string | null;
    }>;
    findAll(position?: string, enabled?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
        position: "HERO" | "DEALS" | "DEALS_HORIZONTAL" | "MIDDLE" | "BOTTOM" | "COLLECTION_TOP";
        desktopImageId: string | null;
        mobileImageId: string | null;
        collectionId: string | null;
        collection: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            slug: string;
            enabled: boolean;
            assetId: string | null;
            sortOrder: number;
            parentId: string | null;
            showInMostShopped: boolean;
        } | null;
        desktopImage: {
            id: string;
            name: string;
            createdAt: Date;
            type: "IMAGE" | "VIDEO" | "DOCUMENT";
            mimeType: string;
            fileSize: number;
            source: string;
            preview: string;
            width: number | null;
            height: number | null;
        } | null;
        mobileImage: {
            id: string;
            name: string;
            createdAt: Date;
            type: "IMAGE" | "VIDEO" | "DOCUMENT";
            mimeType: string;
            fileSize: number;
            source: string;
            preview: string;
            width: number | null;
            height: number | null;
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
        position: "HERO" | "DEALS" | "DEALS_HORIZONTAL" | "MIDDLE" | "BOTTOM" | "COLLECTION_TOP";
        desktopImageId: string | null;
        mobileImageId: string | null;
        collectionId: string | null;
        collection: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            slug: string;
            enabled: boolean;
            assetId: string | null;
            sortOrder: number;
            parentId: string | null;
            showInMostShopped: boolean;
        } | null;
        desktopImage: {
            id: string;
            name: string;
            createdAt: Date;
            type: "IMAGE" | "VIDEO" | "DOCUMENT";
            mimeType: string;
            fileSize: number;
            source: string;
            preview: string;
            width: number | null;
            height: number | null;
        } | null;
        mobileImage: {
            id: string;
            name: string;
            createdAt: Date;
            type: "IMAGE" | "VIDEO" | "DOCUMENT";
            mimeType: string;
            fileSize: number;
            source: string;
            preview: string;
            width: number | null;
            height: number | null;
        } | null;
    } | undefined>;
    update(id: string, data: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
