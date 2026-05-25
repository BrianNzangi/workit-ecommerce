import postgres from 'postgres';

const url = 'postgresql://postgres:%23%23%40Scottish%21@localhost:5433/workit-db';
const sql = postgres(url);

try {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "BrandCollection" (
      "id" text PRIMARY KEY NOT NULL,
      "brandId" text NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
      "collectionId" text NOT NULL REFERENCES "Collection"("id") ON DELETE CASCADE,
      "sortOrder" integer DEFAULT 0 NOT NULL,
      CONSTRAINT "BrandCollection_brandId_collectionId_unique" UNIQUE("brandId","collectionId")
    );
  `);
  console.log('BrandCollection table created successfully');
} catch (e) {
  console.error('Migration failed:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
