import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
export declare class AssetsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getAssets(take?: number, skip?: number): Promise<{
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
    }[]>;
    getAsset(id: string): Promise<{
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
    }>;
    createAsset(input: any): Promise<{
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
    }>;
    deleteAsset(id: string): Promise<{
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
    }>;
}
