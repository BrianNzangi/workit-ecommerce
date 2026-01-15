import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { role, enabled } = body;

        // Get current user
        const currentUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email! },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only SUPER_ADMIN can update user roles and status
        if (currentUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only Super Admins can update users' },
                { status: 403 }
            );
        }

        // Prevent disabling or demoting yourself
        if (currentUser.id === id) {
            if (enabled === false) {
                return NextResponse.json(
                    { error: 'You cannot disable your own account' },
                    { status: 400 }
                );
            }
            if (role && role !== 'SUPER_ADMIN') {
                return NextResponse.json(
                    { error: 'You cannot change your own role' },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updatedUser = await prisma.adminUser.update({
            where: { id },
            data: {
                ...(role && { role }),
                ...(typeof enabled === 'boolean' && { enabled }),
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

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating admin user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        // Get current user
        const currentUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email! },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only SUPER_ADMIN can delete users
        if (currentUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only Super Admins can delete users' },
                { status: 403 }
            );
        }

        // Prevent deleting yourself
        if (currentUser.id === id) {
            return NextResponse.json(
                { error: 'You cannot delete your own account' },
                { status: 400 }
            );
        }

        // Delete user
        await prisma.adminUser.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting admin user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
