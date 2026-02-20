import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

export interface StorageConfig {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
}

export class StorageService {
    private client: S3Client;
    private bucket: string;

    constructor(config: StorageConfig) {
        this.bucket = config.bucket;
        this.client = new S3Client({
            endpoint: config.endpoint,
            region: config.region || "us-east-1",
            credentials: {
                accessKeyId: config.accessKey,
                secretAccessKey: config.secretKey,
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    /**
     * Ensure the target bucket exists.
     * This is idempotent: it only creates the bucket if missing.
     */
    async ensureBucketExists(): Promise<void> {
        const maxAttempts = 15;
        const retryDelayMs = 1500;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.client.send(
                    new HeadBucketCommand({
                        Bucket: this.bucket,
                    })
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

                if (isMissingBucket) {
                    try {
                        await this.client.send(
                            new CreateBucketCommand({
                                Bucket: this.bucket,
                            })
                        );
                        return;
                    } catch (createError: any) {
                        const createErrorName = createError?.name || createError?.Code;
                        if (createErrorName === "BucketAlreadyOwnedByYou" || createErrorName === "BucketAlreadyExists") {
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
                } else if (!isRetriableConnectionError || attempt === maxAttempts) {
                    throw error;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
    }

    /**
     * Upload a file to S3/MinIO
     */
    async upload(key: string, body: Buffer | Readable, contentType: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })
        );
    }

    /**
     * Get a readable stream for a file from S3/MinIO
     */
    async getObject(key: string): Promise<{ stream: Readable; contentType?: string; contentLength?: number }> {
        const response = await this.client.send(
            new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            })
        );

        return {
            stream: response.Body as Readable,
            contentType: response.ContentType,
            contentLength: response.ContentLength,
        };
    }

    /**
     * Delete a file from S3/MinIO
     */
    async delete(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            })
        );
    }

    /**
     * Get the public-facing URL for a file (proxied through the backend)
     */
    getPublicUrl(key: string): string {
        return `/uploads/${key}`;
    }
}

// Singleton instance — configured via environment variables
const defaultEndpoint = process.env.NODE_ENV === 'production'
    ? "http://minio:9000"      // Docker network hostname
    : "http://localhost:9000"; // Local dev

export const storageService = new StorageService({
    endpoint: process.env.S3_ENDPOINT || defaultEndpoint,
    accessKey: process.env.S3_ACCESS_KEY || "minioadmin",
    secretKey: process.env.S3_SECRET_KEY || "5smbsqzmpdy1f464",
    bucket: process.env.S3_BUCKET || "workit-bucket",
    region: process.env.S3_REGION || "us-east-1",
});
