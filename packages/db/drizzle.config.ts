import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" }); // Load from root .env if possible, or assume env vars are set

export default defineConfig({
    schema: process.env.DRIZZLE_SCHEMA_PATH || "./src/schema/*.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
