import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const all = await sql`SELECT id, name, enabled, "showInMostShopped" FROM "Collection"`;
    console.log("DB count:", all.length);
    console.log("DB showInMostShopped count:", all.filter(c => c.showInMostShopped).length);

    try {
        const res = await fetch('http://localhost:3001/store/collections');
        const data = await res.json();
        const collections = data.collections || [];
        console.log("API count:", collections.length);
        console.log("API showInMostShopped count:", collections.filter((c: any) => c.showInMostShopped).length);
    } catch (e: any) {
        console.error("Failed to fetch from backend API", e.message);
    }

    await sql.end();
}

check();
