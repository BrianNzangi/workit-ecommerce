import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Build-safe check: skip throwing during Next.js build phase
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !connectionString);

if (!connectionString) {
    if (isBuildTime) {
        console.warn("⚠️ DATABASE_URL is not defined - using build-time stub");
    } else if (process.env.NODE_ENV === "production" && !process.env.SKIP_DB_CHECK) {
        throw new Error("DATABASE_URL is not defined");
    } else {
        console.warn("⚠️ DATABASE_URL is not defined, using default local postgres");
    }
}

// Use a dummy connection string during build to prevent postgres-js from throwing
const client = postgres(connectionString || "postgresql://postgres:postgres@localhost:5432/workit-db", {
    max: isBuildTime ? 0 : undefined,
    onnotice: isBuildTime ? () => { } : undefined,
});

export const db = drizzle(client, { schema }) as any;
