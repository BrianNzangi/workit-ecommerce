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
    log: ['query', 'error', 'warn'],
});

async function checkAndCreateAdmin() {
    try {
        console.log('🔍 Checking for existing admin users...\n');

        // Check if any admin users exist
        const adminUsers = await prisma.adminUser.findMany();

        console.log(`Found ${adminUsers.length} admin user(s) in the database:`);
        adminUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.role}) - Enabled: ${user.enabled}`);
        });
        console.log('');

        const email = 'admin@workit.com';
        const password = 'admin123456';

        // Check if our specific admin exists
        const existingUser = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('✅ Admin user already exists!');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);
            console.log('👤 Role:', existingUser.role);
            console.log('✓ Enabled:', existingUser.enabled);

            // Test password hash
            const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
            console.log('🔐 Password hash valid:', isPasswordValid);

            if (!isPasswordValid) {
                console.log('\n⚠️  Password hash is invalid! Updating password...');
                const newPasswordHash = await bcrypt.hash(password, 10);
                await prisma.adminUser.update({
                    where: { email },
                    data: { passwordHash: newPasswordHash },
                });
                console.log('✅ Password updated successfully!');
            }
        } else {
            console.log('❌ Admin user does not exist. Creating...\n');

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.adminUser.create({
                data: {
                    email,
                    passwordHash,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'SUPER_ADMIN',
                    enabled: true,
                },
            });

            console.log('✅ Admin user created successfully!');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);
            console.log('👤 Role:', user.role);
            console.log('✓ Enabled:', user.enabled);
        }

        console.log('\n⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

checkAndCreateAdmin();
