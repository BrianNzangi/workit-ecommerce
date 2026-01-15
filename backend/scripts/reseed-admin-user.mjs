import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Create a connection pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Create the Prisma client with the adapter
const prisma = new PrismaClient({
    adapter,
});

async function reseedAdminUser() {
    try {
        console.log('Reseeding admin user...');

        const email = 'admin@workit.com';
        const password = 'admin123456';
        const firstName = 'Admin';
        const lastName = 'User';

        // Delete existing admin user if exists
        const existingUser = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('🗑️  Deleting existing admin user...');
            await prisma.adminUser.delete({
                where: { email },
            });
            console.log('✅ Existing admin user deleted');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new admin user
        const user = await prisma.adminUser.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role: 'SUPER_ADMIN',
                enabled: true,
            },
        });

        console.log('\n✅ Admin user reseeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Role:', user.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error reseeding admin user:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

reseedAdminUser();
