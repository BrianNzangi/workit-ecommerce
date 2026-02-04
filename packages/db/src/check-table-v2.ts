import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'Collection'`;
    const names = columns.map(c => c.column_name);
    console.log("Columns in Collection table:", names.join(", "));

    if (names.includes('showInMostShopped')) {
        const hasTrue = await sql`SELECT count(*) FROM "Collection" WHERE "showInMostShopped" = true`;
        console.log("Collections with showInMostShopped=true:", hasTrue[0].count);
    } else {
        console.log("COLUMN showInMostShopped MISSING!");
    }

    const hpc = await sql`SELECT count(*) FROM "HomepageCollection"`;
    console.log("Homepage Collections count:", hpc[0].count);

    const hpcp = await sql`SELECT count(*) FROM "HomepageCollectionProduct"`;
    console.log("Homepage Collection Products count:", hpcp[0].count);

    await sql.end();
}

check();
