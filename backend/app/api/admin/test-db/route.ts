import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/test-db - Test database connection and check for Setting table
export async function GET(request: NextRequest) {
    try {
        // Test raw query to check database
        const result = await prisma.$queryRaw`
            SELECT 
                current_database() as database_name,
                current_schema() as current_schema,
                (SELECT string_agg(nspname, ', ') FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema') as schemas,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'Setting'
                ) AS setting_exists
        `;

        // Try to list all tables
        const tables = await prisma.$queryRaw`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `;

        return NextResponse.json({
            connection: result,
            tables: tables,
            message: 'Database connection test successful'
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json(
            {
                error: 'Database test failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
