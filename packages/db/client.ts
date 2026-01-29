import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./index";

const globalForDb = globalThis as unknown as {
    client: postgres.Sql | undefined;
    db: ReturnType<typeof drizzle> | undefined;
};

const getDbUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url && process.env.NODE_ENV === "production") {
        // Next.js sets NEXT_PHASE during build. We skip the strict check during build.
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            return "postgres://postgres:postgres@localhost:5432/workit-db";
        }
        throw new Error("CRITICAL: DATABASE_URL is missing in production environment!");
    }
    return url || "postgres://postgres:postgres@localhost:5432/workit-db";
};

export const client = globalForDb.client || postgres(getDbUrl());
export const db = globalForDb.db || drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
    globalForDb.client = client;
    globalForDb.db = db;
}
