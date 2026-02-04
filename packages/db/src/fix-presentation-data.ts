import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const sql = postgres(connectionString);

async function fix() {
    console.log("Fixing data for featured components...");

    // 1. Enable showInMostShopped for all collections
    await sql`UPDATE "Collection" SET "showInMostShopped" = true`;
    console.log("✅ Enabled showInMostShopped for all collections.");

    // 2. Link some products to HomepageCollection
    const products = await sql`SELECT id FROM "Product"`;
    const hpc = await sql`SELECT id FROM "HomepageCollection"`;

    if (products.length > 0 && hpc.length > 0) {
        for (const collection of hpc) {
            for (const product of products) {
                const id = "hpcp-" + Math.random().toString(36).substring(7);
                await sql`
                    INSERT INTO "HomepageCollectionProduct" (id, "collectionId", "productId", "sortOrder")
                    VALUES (${id}, ${collection.id}, ${product.id}, 0)
                    ON CONFLICT DO NOTHING
                `;
            }
        }
        console.log(`✅ Linked ${products.length} products to ${hpc.length} homepage collections.`);
    } else {
        console.warn("⚠️ No products or homepage collections found to link.");
    }

    await sql.end();
}

fix();
