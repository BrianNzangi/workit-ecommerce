type AlgoliaConfig = {
    appId: string;
    adminApiKey: string;
    productsIndex: string;
};

type AlgoliaRequestOptions = {
    method?: "GET" | "POST";
    body?: unknown;
    useDsn?: boolean;
};

type AlgoliaSearchOptions = {
    limit?: number;
    filters?: string;
};

type AlgoliaSearchResponse = {
    hits?: Array<{ objectID?: string }>;
};

const DEFAULT_PRODUCTS_INDEX = "products";
const MAX_BATCH_SIZE = 1000;

function getAlgoliaConfig(): AlgoliaConfig | null {
    const appId = process.env.ALGOLIA_APP_ID;
    const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const productsIndex = process.env.ALGOLIA_PRODUCTS_INDEX || DEFAULT_PRODUCTS_INDEX;

    if (!appId || !adminApiKey) {
        return null;
    }

    return { appId, adminApiKey, productsIndex };
}

function getAlgoliaHost(appId: string, useDsn: boolean): string {
    return `https://${appId}${useDsn ? "-dsn" : ""}.algolia.net`;
}

async function algoliaRequest<T = unknown>(
    path: string,
    options: AlgoliaRequestOptions = {}
): Promise<T> {
    const config = getAlgoliaConfig();
    if (!config) {
        throw new Error("Algolia is not configured");
    }

    const { method = "GET", body, useDsn = true } = options;
    const baseUrl = getAlgoliaHost(config.appId, useDsn);
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Algolia-Application-Id": config.appId,
            "X-Algolia-API-Key": config.adminApiKey,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        const message = (data && data.message) ? String(data.message) : `HTTP ${response.status}`;
        throw new Error(`Algolia request failed: ${message}`);
    }

    return data as T;
}

function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

export function isAlgoliaEnabled(): boolean {
    return Boolean(getAlgoliaConfig());
}

export async function searchAlgoliaProductIds(
    query: string,
    options: AlgoliaSearchOptions = {}
): Promise<string[]> {
    const config = getAlgoliaConfig();
    if (!config) {
        return [];
    }

    const { limit = 20, filters } = options;

    const result = await algoliaRequest<AlgoliaSearchResponse>(
        `/1/indexes/${encodeURIComponent(config.productsIndex)}/query`,
        {
            method: "POST",
            useDsn: true,
            body: {
                query,
                hitsPerPage: limit,
                attributesToRetrieve: ["objectID"],
                ...(filters ? { filters } : {}),
            },
        }
    );

    return (result.hits || [])
        .map((hit) => hit.objectID)
        .filter((id): id is string => Boolean(id));
}

export async function upsertAlgoliaProductRecords(records: Array<Record<string, unknown>>): Promise<void> {
    const config = getAlgoliaConfig();
    if (!config || records.length === 0) {
        return;
    }

    const chunks = chunkArray(records, MAX_BATCH_SIZE);

    for (const chunk of chunks) {
        const requests = chunk.map((record) => {
            const objectID = String(record.objectID ?? record.id ?? "");
            return {
                action: "partialUpdateObject",
                body: {
                    ...record,
                    objectID,
                },
            };
        });

        await algoliaRequest(
            `/1/indexes/${encodeURIComponent(config.productsIndex)}/batch`,
            {
                method: "POST",
                useDsn: false,
                body: { requests },
            }
        );
    }
}

export async function deleteAlgoliaProductRecords(productIds: string[]): Promise<void> {
    const config = getAlgoliaConfig();
    if (!config || productIds.length === 0) {
        return;
    }

    const ids = Array.from(new Set(productIds.filter(Boolean)));
    const chunks = chunkArray(ids, MAX_BATCH_SIZE);

    for (const chunk of chunks) {
        const requests = chunk.map((id) => ({
            action: "deleteObject",
            body: { objectID: id },
        }));

        await algoliaRequest(
            `/1/indexes/${encodeURIComponent(config.productsIndex)}/batch`,
            {
                method: "POST",
                useDsn: false,
                body: { requests },
            }
        );
    }
}
