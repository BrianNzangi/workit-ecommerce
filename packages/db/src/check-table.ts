import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Collection'`;
    console.table(columns);

    const data = await sql`SELECT * FROM "Collection" LIMIT 1`;
    console.log("Sample collection data:");
    console.log(data);

    await sql.end();
}

check();
