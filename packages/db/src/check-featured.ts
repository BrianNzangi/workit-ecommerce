import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const sql = postgres(connectionString);

async function check() {
    const products = await sql`SELECT id, name FROM "Product"`;
    console.log("\nProducts:");
    console.table(products);

    const pc = await sql`SELECT id, name, "showInMostShopped" FROM "Collection"`;
    console.log("\nCollections:");
    console.table(pc);

    const hpc = await sql`SELECT id, title, enabled FROM "HomepageCollection"`;
    console.log("\nHomepage Collections:");
    console.table(hpc);

    const hpcp = await sql`SELECT "collectionId", "productId" FROM "HomepageCollectionProduct"`;
    console.log("\nHomepage Collection Products:");
    console.table(hpcp);

    await sql.end();
}

check();
