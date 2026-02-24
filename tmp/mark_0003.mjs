import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const query = `
INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
SELECT '92023BE3C351EF344050CF6C082BB052C0280E1C3CBF2D357710BD951D0BD495', 1771946006681
WHERE NOT EXISTS (
  SELECT 1 FROM "drizzle"."__drizzle_migrations"
  WHERE hash = '92023BE3C351EF344050CF6C082BB052C0280E1C3CBF2D357710BD951D0BD495'
);
`;

try {
  await sql.unsafe(query);
} finally {
  await sql.end({ timeout: 5 });
}
