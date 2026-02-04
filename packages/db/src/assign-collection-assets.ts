import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function assignAssets() {
    console.log("Assigning assets to collections...");

    // Get all collections
    const collections = await sql`SELECT id, name FROM "Collection"`;

    // Get available assets
    const assets = await sql`SELECT id, name, source FROM "Asset"`;

    if (assets.length === 0) {
        console.log("No assets found in database. Collections will display without images.");
        await sql.end();
        return;
    }

    // Assign the first available asset to each collection
    // In a real scenario, you'd want to match assets to collections more intelligently
    const assetId = assets[0].id;

    for (const collection of collections) {
        await sql`UPDATE "Collection" SET "assetId" = ${assetId} WHERE id = ${collection.id}`;
        console.log(`✅ Assigned asset to collection: ${collection.name}`);
    }

    console.log("\n✅ Asset assignment complete!");
    await sql.end();
}

assignAssets();
