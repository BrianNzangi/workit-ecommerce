import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";

export interface StorageConfig {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
    forcePathStyle?: boolean;
    autoCreateBucket?: boolean;
    publicBaseUrl?: string;
}

export class StorageService {
    private client: S3Client;
    private bucket: string;
    private autoCreateBucket: boolean;
    private publicBaseUrl?: string;

    constructor(config: StorageConfig) {
        const normalized = normalizeStorageTarget(config.endpoint, config.bucket);
        this.bucket = normalized.bucket;
        this.autoCreateBucket = config.autoCreateBucket ?? false;
        this.publicBaseUrl = normalizePublicBaseUrl(config.publicBaseUrl);

        this.client = new S3Client({
            endpoint: normalized.endpoint,
            region: config.region || "auto",
            credentials: {
                accessKeyId: config.accessKey,
                secretAccessKey: config.secretKey,
            },
            forcePathStyle: config.forcePathStyle ?? false,
        });
    }

    async ensureBucketExists(): Promise<void> {
        const maxAttempts = 15;
        const retryDelayMs = 1500;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.client.send(
                    new HeadBucketCommand({
                        Bucket: this.bucket,
                    }),
                );
                return;
            } catch (error: any) {
                const statusCode = error?.$metadata?.httpStatusCode;
                const errorName = error?.name || error?.Code;
                const message = String(error?.message || "");
                const isMissingBucket =
                    statusCode === 404 ||
                    errorName === "NotFound" ||
                    errorName === "NoSuchBucket";
                const isRetriableConnectionError =
                    message.includes("ECONNREFUSED") ||
                    message.includes("EAI_AGAIN") ||
                    message.includes("ENOTFOUND") ||
                    errorName === "TimeoutError";

                if (isMissingBucket && this.autoCreateBucket) {
                    try {
                        await this.client.send(
                            new CreateBucketCommand({
                                Bucket: this.bucket,
                            }),
                        );
                        return;
                    } catch (createError: any) {
                        const createErrorName = createError?.name || createError?.Code;
                        if (
                            createErrorName === "BucketAlreadyOwnedByYou" ||
                            createErrorName === "BucketAlreadyExists"
                        ) {
                            return;
                        }

                        const createMessage = String(createError?.message || "");
                        const createRetriable =
                            createMessage.includes("ECONNREFUSED") ||
                            createMessage.includes("EAI_AGAIN") ||
                            createMessage.includes("ENOTFOUND") ||
                            createErrorName === "TimeoutError";

                        if (!createRetriable || attempt === maxAttempts) {
                            throw createError;
                        }
                    }
                } else if (isMissingBucket && !this.autoCreateBucket) {
                    throw new Error(
                        `Storage bucket '${this.bucket}' was not found. Create it in your storage provider or enable S3_AUTO_CREATE_BUCKET=true for local storage.`,
                    );
                } else if (!isRetriableConnectionError || attempt === maxAttempts) {
                    throw error;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
    }

    async upload(key: string, body: Buffer | Readable, contentType: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
                CacheControl: "public, max-age=31536000, immutable",
            }),
        );
    }

    async getObject(key: string): Promise<{ stream: Readable; contentType?: string; contentLength?: number }> {
        const response = await this.client.send(
            new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );

        return {
            stream: response.Body as Readable,
            contentType: response.ContentType,
            contentLength: response.ContentLength,
        };
    }

    async delete(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );
    }

    async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
        });

        return await getSignedUrl(this.client, command, { expiresIn });
    }

    getPublicUrl(key: string): string {
        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl}/${key}`;
        }

        return `/uploads/${key}`;
    }
}

function normalizeStorageTarget(endpoint: string, bucket: string): { endpoint: string; bucket: string } {
    const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");
    const trimmedBucket = bucket.trim();

    if (!trimmedEndpoint) {
        throw new Error("S3_ENDPOINT is required");
    }

    if (!trimmedBucket) {
        throw new Error("S3_BUCKET is required");
    }

    try {
        const url = new URL(trimmedEndpoint);
        const pathParts = url.pathname.split("/").filter(Boolean);

        if (pathParts.length === 1 && pathParts[0] === trimmedBucket) {
            url.pathname = "";
            return {
                endpoint: url.toString().replace(/\/$/, ""),
                bucket: trimmedBucket,
            };
        }
    } catch {
        // Leave malformed endpoints to the AWS SDK error path.
    }

    return {
        endpoint: trimmedEndpoint,
        bucket: trimmedBucket,
    };
}

function normalizePublicBaseUrl(url?: string): string | undefined {
    const value = url?.trim();
    if (!value) {
        return undefined;
    }

    return value.replace(/\/+$/, "");
}

function getBooleanEnv(name: string, defaultValue: boolean): boolean {
    const value = process.env[name];
    if (value === undefined) {
        return defaultValue;
    }

    return value.toLowerCase() === "true" || value === "1";
}

const defaultEndpoint = process.env.S3_ENDPOINT
    || "https://s3.amazonaws.com";

export const storageService = new StorageService({
    endpoint: defaultEndpoint,
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET || "workit",
    region: process.env.S3_REGION || "us-east-1",
    forcePathStyle: getBooleanEnv("S3_FORCE_PATH_STYLE", false),
    autoCreateBucket: getBooleanEnv("S3_AUTO_CREATE_BUCKET", false),
    publicBaseUrl: process.env.PUBLIC_MEDIA_URL,
});
