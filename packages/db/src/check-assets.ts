import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const collections = await sql`SELECT id, name, "assetId" FROM "Collection"`;
    console.log("Collections and their assets:");
    collections.forEach(c => {
        console.log(`- ${c.name}: assetId = ${c.assetId || 'NULL'}`);
    });

    const assets = await sql`SELECT id, name, source FROM "Asset" LIMIT 5`;
    console.log("\nAvailable assets:");
    console.table(assets);

    await sql.end();
}

check();
