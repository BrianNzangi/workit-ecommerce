import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const collections = await sql`SELECT id, name, "parentId", enabled, "showInMostShopped" FROM "Collection"`;
    console.log("Collections Hierarchy:");
    collections.forEach(c => {
        console.log(`- ${c.name} (ID: ${c.id}, Parent: ${c.parentId}, Enabled: ${c.enabled}, MostShopped: ${c.showInMostShopped})`);
    });
    await sql.end();
}

check();
