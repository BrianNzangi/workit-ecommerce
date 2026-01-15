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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    const email = 'admin@workit.com';
    const password = 'admin123456'; // Change this!
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Admin user already exists with email:', email);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
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

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
