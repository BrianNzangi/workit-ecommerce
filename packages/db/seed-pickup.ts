import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres({
    host: 'localhost',
    port: 5433,
    database: 'workit-db',
    username: 'postgres',
    password: '##@Scottish!',
});

async function main() {
    console.log('Adding pickup shipping method via raw SQL (object config)...');
    try {
        await sql`
      INSERT INTO "ShippingMethod" (id, code, name, description, enabled, "isExpress", "createdAt", "updatedAt")
      VALUES ('pickup', 'pickup', 'Store Pickup', 'Pick up your order at our physical store location', true, false, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sql.end();
    }
}

main();
