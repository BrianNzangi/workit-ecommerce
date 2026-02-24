import postgres from "postgres";
import fs from "node:fs";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const query = fs.readFileSync("packages/db/drizzle/0003_campaign_redemptions.sql", "utf8");

try {
  await sql.unsafe(query);
} finally {
  await sql.end({ timeout: 5 });
}
