import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.adminUser.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                enabled: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only SUPER_ADMIN can create users
        const currentUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email! },
        });

        if (currentUser?.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only Super Admins can create users' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { email, firstName, lastName, role, password } = body;

        // Validate required fields
        if (!email || !firstName || !lastName || !role || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.adminUser.create({
            data: {
                email,
                firstName,
                lastName,
                role,
                passwordHash,
                enabled: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                enabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error creating admin user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
