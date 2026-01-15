import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const adminEmail = 'admin@workit.com';
        const adminPassword = 'admin123456';

        console.log('Creating admin user...');

        // Check if admin already exists
        const existingAdmin = await prisma.adminUser.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', adminEmail);
            console.log('You can use the existing credentials to login.');
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const admin = await prisma.adminUser.create({
            data: {
                email: adminEmail,
                passwordHash: passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: 'SUPER_ADMIN',
                enabled: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('Role:', admin.role);

    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
