import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    if (process.env.NODE_ENV === "production" && !process.env.SKIP_DB_CHECK) {
        throw new Error("DATABASE_URL is not defined");
    } else {
        console.warn("⚠️ DATABASE_URL is not defined, using default local postgres");
    }
}

const client = postgres(connectionString || "postgresql://postgres:postgres@localhost:5432/workit-db");

export const db = drizzle(client, { schema }) as any;
