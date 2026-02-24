import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const query = `
CREATE SCHEMA IF NOT EXISTS "drizzle";

CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at numeric
);

INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
SELECT 'DBFDBE1CAD4DE64A08AEEE2A37561BF7533C9DF0D52965011E60673ADDBD5AB1', 1770030724866
WHERE NOT EXISTS (
  SELECT 1 FROM "drizzle"."__drizzle_migrations"
  WHERE hash = 'DBFDBE1CAD4DE64A08AEEE2A37561BF7533C9DF0D52965011E60673ADDBD5AB1'
);

INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
SELECT '7C25282345267D66930E9B98A60A903DE3EC3D9E0AD383D2FE3687825E23583E', 1771600000000
WHERE NOT EXISTS (
  SELECT 1 FROM "drizzle"."__drizzle_migrations"
  WHERE hash = '7C25282345267D66930E9B98A60A903DE3EC3D9E0AD383D2FE3687825E23583E'
);

INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
SELECT 'EFBFA2780BC9793BEF4BB92C756EB73D6F6D1AA21D861E2F00BABF158A9F1AE7', 1771600500000
WHERE NOT EXISTS (
  SELECT 1 FROM "drizzle"."__drizzle_migrations"
  WHERE hash = 'EFBFA2780BC9793BEF4BB92C756EB73D6F6D1AA21D861E2F00BABF158A9F1AE7'
);
`;

try {
  await sql.unsafe(query);
} finally {
  await sql.end({ timeout: 5 });
}
