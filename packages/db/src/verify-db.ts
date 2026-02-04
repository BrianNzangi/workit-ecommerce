
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./index.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function verify() {
    console.log("Verifying database...");
    console.log("DB URL:", connectionString?.replace(/:[^:@]*@/, ":***@")); // Log masked URL

    try {
        const usersTable = schema.users || schema.user;
        const admin = await db.query.users.findFirst({
            where: eq(usersTable.email, "admin@workit.co.ke")
        });

        if (admin) {
            console.log("✅ Admin user found:");
            console.log("ID:", admin.id);
            console.log("Email:", admin.email);
            console.log("Role:", admin.role);
            console.log("Password Hash Length:", admin.password ? admin.password.length : "NULL");
        } else {
            console.error("❌ Admin user NOT found in database.");
        }

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        await client.end();
    }
}

verify();
