import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '@workit/db';

async function verify() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL not set');
    const queryClient = postgres(connectionString);
    const db = drizzle(queryClient, { schema });

    try {
        const users = await db.select().from(schema.user);
        const adminUser = users.find(u => u.email === 'admin@workit.co.ke');
        let accounts: any[] = [];
        if (adminUser) {
            accounts = await db.select().from(schema.account).where(eq(schema.account.userId, adminUser.id));
        }

        const fs = await import('fs');
        fs.writeFileSync('auth-verify.json', JSON.stringify({ users, accounts }, null, 2));
        console.log('Results written to auth-verify.json');
    } catch (e) {
        console.error(e);
    } finally {
        await queryClient.end();
    }
}
verify();
