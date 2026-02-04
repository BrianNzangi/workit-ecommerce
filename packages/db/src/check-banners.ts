import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
    const banners = await sql`SELECT id, title, slug, position, enabled FROM "Banner"`;
    console.log(`Total banners in database: ${banners.length}`);

    if (banners.length > 0) {
        console.log("\nBanners:");
        banners.forEach(b => {
            console.log(`- ${b.title} (${b.slug}) - Position: ${b.position}, Enabled: ${b.enabled}`);
        });
    } else {
        console.log("\n⚠️  No banners found in database!");
    }

    await sql.end();
}

check();
