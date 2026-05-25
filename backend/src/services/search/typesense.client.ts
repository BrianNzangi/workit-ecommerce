import Typesense from "typesense";

let client: Typesense.Client | null = null;

function getTypesenseConfig(): {
    host: string;
    port: number;
    protocol: string;
    apiKey: string;
    productsCollection: string;
    collectionsCollection: string;
} | null {
    const host = process.env.TYPESENSE_HOST;
    const port = Number(process.env.TYPESENSE_PORT || "8108");
    const protocol = process.env.TYPESENSE_PROTOCOL || "http";
    const apiKey = process.env.TYPESENSE_API_KEY;
    const productsCollection = process.env.TYPESENSE_PRODUCTS_COLLECTION || "products";
    const collectionsCollection = process.env.TYPESENSE_COLLECTIONS_COLLECTION || "collections";

    if (!host || !apiKey) {
        return null;
    }

    return { host, port, protocol, apiKey, productsCollection, collectionsCollection };
}

export function getTypesenseClient(): Typesense.Client | null {
    const config = getTypesenseConfig();
    if (!config) return null;

    if (!client) {
        client = new Typesense.Client({
            nodes: [
                {
                    host: config.host,
                    port: config.port,
                    protocol: config.protocol,
                },
            ],
            apiKey: config.apiKey,
            connectionTimeoutSeconds: 5,
        });
    }

    return client;
}

export function isTypesenseEnabled(): boolean {
    return getTypesenseConfig() !== null;
}

async function ensureCollection(name: string, schema: any): Promise<void> {
    const tsClient = getTypesenseClient();
    if (!tsClient) return;

    try {
        await tsClient.collections(name).retrieve();
    } catch {
        await tsClient.collections().create(schema);
    }
}

function parseImportFailures(result: unknown): string[] {
    const rows = Array.isArray(result)
        ? result
        : typeof result === "string"
            ? result
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return { success: false, error: line };
                    }
                })
            : [];

    return rows
        .filter((row: any) => row && row.success === false)
        .map((row: any) => row.error || JSON.stringify(row));
}

function assertSuccessfulImport(result: unknown, collectionName: string): void {
    const failures = parseImportFailures(result);
    if (failures.length > 0) {
        throw new Error(`Typesense import into "${collectionName}" failed: ${failures.slice(0, 3).join("; ")}`);
    }
}

export async function ensureTypesenseSchema(): Promise<void> {
    const config = getTypesenseConfig();
    if (!config) return;

    await ensureCollection(config.productsCollection, {
        name: config.productsCollection,
        fields: [
            { name: "id", type: "string" },
            { name: "name", type: "string" },
            { name: "slug", type: "string" },
            { name: "sku", type: "string", optional: true },
            { name: "description", type: "string", optional: true },
            { name: "enabled", type: "bool" },
            { name: "salePrice", type: "float", optional: true },
            { name: "originalPrice", type: "float", optional: true },
            { name: "stockOnHand", type: "int32" },
            { name: "inStock", type: "bool" },
            { name: "condition", type: "string", optional: true },
            { name: "brandId", type: "string", optional: true },
            { name: "brandName", type: "string", optional: true },
            { name: "brandSlug", type: "string", optional: true },
            { name: "collectionIds", type: "string[]" },
            { name: "collectionNames", type: "string[]" },
            { name: "collectionSlugs", type: "string[]" },
            { name: "image", type: "string", optional: true },
            { name: "searchableText", type: "string" },
            { name: "createdAt", type: "string", optional: true },
            { name: "updatedAt", type: "string", optional: true },
        ],
        default_sorting_field: "stockOnHand",
    });

    await ensureCollection(config.collectionsCollection, {
        name: config.collectionsCollection,
        fields: [
            { name: "id", type: "string" },
            { name: "name", type: "string" },
            { name: "slug", type: "string" },
            { name: "description", type: "string", optional: true },
        ],
    });
}

export async function searchTypesenseProductIds(
    query: string,
    options: { limit?: number; filters?: string } = {}
): Promise<string[]> {
    const config = getTypesenseConfig();
    if (!config) return [];

    const tsClient = getTypesenseClient();
    if (!tsClient) return [];

    const { limit = 20, filters } = options;

    const searchParams: any = {
        q: query,
        query_by: "name,sku,description,brandName,searchableText",
        per_page: limit,
        include_fields: "id",
    };

    if (filters) {
        searchParams.filter_by = filters;
    }

    try {
        const results = await tsClient
            .collections(config.productsCollection)
            .documents()
            .search(searchParams);

        return (results.hits || [])
            .map((hit) => (hit.document as any)?.id as string | undefined)
            .filter((id): id is string => Boolean(id));
    } catch (error) {
        console.error("Typesense search error:", error);
        return [];
    }
}

export async function upsertTypesenseProductRecords(records: Array<Record<string, unknown>>): Promise<void> {
    const config = getTypesenseConfig();
    if (!config || records.length === 0) return;

    const tsClient = getTypesenseClient();
    if (!tsClient) return;

    const documents = records.map((record) => ({
        ...record,
        id: String(record.id || record.objectID || ""),
    }));

    try {
        await ensureTypesenseSchema();
        const result = await tsClient
            .collections(config.productsCollection)
            .documents()
            .import(documents, { action: "upsert" });
        assertSuccessfulImport(result, config.productsCollection);
    } catch (error) {
        console.error("Typesense upsert error:", error);
        throw error;
    }
}

export async function upsertTypesenseCollectionRecords(records: Array<Record<string, unknown>>): Promise<void> {
    const config = getTypesenseConfig();
    if (!config || records.length === 0) return;

    const tsClient = getTypesenseClient();
    if (!tsClient) return;

    const documents = records.map((record) => ({
        ...record,
        id: String(record.id || ""),
        description: String(record.description || ""),
    }));

    try {
        await ensureTypesenseSchema();
        const result = await tsClient
            .collections(config.collectionsCollection)
            .documents()
            .import(documents, { action: "upsert" });
        assertSuccessfulImport(result, config.collectionsCollection);
    } catch (error) {
        console.error("Typesense collection upsert error:", error);
        throw error;
    }
}

export async function deleteTypesenseProductRecords(productIds: string[]): Promise<void> {
    const config = getTypesenseConfig();
    if (!config || productIds.length === 0) return;

    const tsClient = getTypesenseClient();
    if (!tsClient) return;

    const ids = Array.from(new Set(productIds.filter(Boolean)));

    try {
        await Promise.all(
            ids.map((id) =>
                tsClient
                    .collections(config.productsCollection)
                    .documents(id)
                    .delete()
            )
        );
    } catch (error) {
        console.error("Typesense delete error:", error);
    }
}
