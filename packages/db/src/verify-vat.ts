import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const connectionString = "postgresql://postgres:%23%23%40Scottish%21@localhost:5433/workit-db";
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function verify() {
    console.log("Verifying VAT implementation...");

    const testId = uuidv4();
    const testSlug = `test-product-vat-${Date.now()}`;

    console.log(`Creating test product: ${testSlug}`);

    try {
        await db.insert(schema.products).values({
            id: testId,
            name: "Test VAT Product",
            slug: testSlug,
            salePrice: 1000,
            vat: 16.0,
            vatInclusive: false,
            enabled: true,
        });

        console.log("Product inserted successfully.");

        // Fetch back to verify persistence
        const persisted = await db.query.products.findFirst({
            where: eq(schema.products.id, testId)
        });

        if (persisted && persisted.vat === 16.0 && persisted.vatInclusive === false) {
            console.log("SUCCESS: VAT fields persisted correctly in database.");
        } else {
            console.error("FAILURE: Database persistence check failed.", persisted);
        }

        // Cleanup
        await db.delete(schema.products).where(eq(schema.products.id, testId));
        console.log("Test product cleaned up.");

    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        await client.end();
    }
}

verify().catch(console.error);
