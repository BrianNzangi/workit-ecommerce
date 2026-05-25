#!/usr/bin/env tsx
import { db, schema } from "@workit/db";
import { isNotNull } from "drizzle-orm";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { StorageService } from "../src/lib/storage.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, "..", "uploads");

const storage = new StorageService({
    endpoint: process.env.S3_ENDPOINT || "https://s3.amazonaws.com",
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET || "workit",
    region: process.env.S3_REGION || "auto",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    autoCreateBucket: false,
});

function extractFilename(path: string): string | null {
    const cleaned = path.replace(/^\/?(uploads\/)?/, "");
    return cleaned || null;
}

async function main() {
    console.log("Scanning assets table for missing S3 uploads...\n");

    const assets = await db.query.assets.findMany({
        where: isNotNull(schema.assets.source),
    });

    console.log(`Found ${assets.length} assets with source paths.\n`);

    let uploaded = 0;
    let skipped = 0;
    let missing = 0;

    for (const asset of assets) {
        const filenames = new Set<string>();
        const srcFile = extractFilename(asset.source || "");
        if (srcFile) filenames.add(srcFile);
        const prevFile = extractFilename(asset.preview || "");
        if (prevFile) filenames.add(prevFile);

        for (const filename of filenames) {
            try {
                await storage.getObject(filename);
                skipped++;
                continue;
            } catch (err: any) {
                if (err.name !== "NoSuchKey" && err.$metadata?.httpStatusCode !== 404) {
                    console.error(`  Error checking ${filename}: ${err.message}`);
                    continue;
                }
            }

            const localPath = join(UPLOADS_DIR, filename);
            if (!existsSync(localPath)) {
                console.log(`  MISSING: ${filename} — not in S3 or local uploads/`);
                missing++;
                continue;
            }

            const ext = filename.split(".").pop()?.toLowerCase() || "";
            const mime =
                ext === "png" ? "image/png"
                : ext === "webp" ? "image/webp"
                : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
                : ext === "svg" ? "image/svg+xml"
                : ext === "gif" ? "image/gif"
                : "application/octet-stream";

            const buffer = readFileSync(localPath);
            await storage.upload(filename, buffer, mime);
            console.log(`  UPLOADED: ${filename} (${asset.name || asset.id})`);
            uploaded++;
        }
    }

    console.log(`\nDone. Uploaded: ${uploaded}, Skipped (in S3): ${skipped}, Missing locally: ${missing}`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
