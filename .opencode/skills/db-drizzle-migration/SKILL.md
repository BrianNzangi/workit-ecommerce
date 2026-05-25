---
name: db-drizzle-migration
description: Create and apply PostgreSQL schema migrations via Drizzle
compatibility: opencode
metadata:
  orm: drizzle
  database: postgresql
  project: workit-ecommerce
---

## What I do

Generate Drizzle migration SQL files and apply them to the PostgreSQL database.

## When to use me

Use this when schema files in `packages/db/src/schema/` have changed and the database needs updating — new tables, columns, enums, or index changes.

## Migration methods

### Method A: Auto-generate with Drizzle Kit

```bash
cd packages/db
npx drizzle-kit generate --config=drizzle.config.ts
```

This produces a numbered SQL file in `packages/db/drizzle/` and updates `meta/_journal.json`.

### Method B: Manual SQL (for enum changes or complex operations)

For enum type changes (PostgreSQL can't drop enum values), use CREATE TYPE + ALTER COLUMN + DROP TYPE pattern:

```sql
-- Example: replacing enum values
CREATE TYPE "EnumName_new" AS ENUM ('VAL1', 'VAL2', 'VAL3');
ALTER TABLE "TableName" ALTER COLUMN "colName" DROP DEFAULT;
ALTER TABLE "TableName" ALTER COLUMN "colName" TYPE "EnumName_new" USING (
    CASE "colName"::text
        WHEN 'OLD_VAL' THEN 'NEW_VAL'::text
        ELSE "colName"::text
    END
)::"EnumName_new";
ALTER TABLE "TableName" ALTER COLUMN "colName" SET DEFAULT 'VAL1';
DROP TYPE "EnumName";
ALTER TYPE "EnumName_new" RENAME TO "EnumName";
```

## File naming

```
packages/db/drizzle/<XXXX>_<descriptive_name>.sql
```

Where XXXX is the next sequential number (e.g., 0009 after 0008).

## How to apply

### Find the DATABASE_URL

In `backend/.env`:
```
DATABASE_URL="postgresql://user:encoded-password@host:port/db"
```

### Run via Node with postgres client

```js
const postgres = require('postgres');
const fs = require('fs');
const sql = fs.readFileSync('packages/db/drizzle/XXXX_name.sql', 'utf8');
const url = 'postgresql://...';
const client = postgres(url);
await client.unsafe(sql);
await client.end();
```

The `postgres` module is at: `node_modules/.pnpm/postgres@3.4.8/node_modules/postgres/cjs/src/index.js`

Use `require('C:/full/path/to/postgres/cjs/src/index.js')` if running from workspace root.

### After applying

If using manual SQL (Method B), optionally update `meta/_journal.json` to add an entry so Drizzle Kit's migrate command tracks it.

## Drizzle Kit config

Location: `packages/db/drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

## NPM scripts

From `packages/db/package.json`:
- `npm run generate` — `drizzle-kit generate`
- `npm run migrate` — `drizzle-kit migrate`
- `npm run push` — `drizzle-kit push`

## References

- Existing migrations: `packages/db/drizzle/0000_*.sql` through `packages/db/drizzle/0009_*.sql`
- Schema: `packages/db/src/schema/promotions.ts`
- Migration journal: `packages/db/drizzle/meta/_journal.json`
