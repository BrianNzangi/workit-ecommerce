
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString);

async function reset() {
    console.log("Resetting database...");

    try {
        // Drop public schema and recreate it to remove all tables and types
        await client`DROP SCHEMA public CASCADE`;
        await client`CREATE SCHEMA public`;
        await client`GRANT ALL ON SCHEMA public TO postgres`;
        await client`GRANT ALL ON SCHEMA public TO public`;
        console.log("Database reset complete (public schema recreated).");
    } catch (e) {
        console.error("Database reset failed:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

reset();
