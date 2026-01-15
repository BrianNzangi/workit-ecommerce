import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const { Client } = pg;

async function applyMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Read the migration SQL file
        const migrationPath = join(__dirname, '..', 'prisma', 'migrations', '20251206144148_init', 'migration.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('📝 Applying migration...\n');

        // Execute the migration
        await client.query(migrationSQL);

        console.log('✅ Migration applied successfully!\n');
        console.log('📊 Database tables created.');

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error applying migration:', error.message);
        if (error.message.includes('already exists')) {
            console.log('\n✅ Tables already exist - this is fine!');
            process.exit(0);
        }
        process.exit(1);
    }
}

applyMigration();
