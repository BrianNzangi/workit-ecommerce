import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const result = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'CampaignRedemption'
  `;
  console.log(result);
} finally {
  await sql.end({ timeout: 5 });
}
