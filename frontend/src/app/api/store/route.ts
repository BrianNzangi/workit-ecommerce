/**
 * GraphQL API Route for Store Operations
 * 
 * Handles GraphQL queries and mutations for:
 * - Products
 * - Cart operations
 * - Orders
 * - Customer data
 * 
 * Proxies requests to the backend GraphQL API at http://localhost:3001
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function POST(request: NextRequest) {
    try {
        // Parse the GraphQL request body
        const body = await request.json();
        const { query, variables, operationName } = body;

        if (!query) {
            return NextResponse.json(
                {
                    errors: [{ message: 'GraphQL query is required' }]
                },
                { status: 400 }
            );
        }

        // Forward the GraphQL request to the backend
        const response = await fetch(`${BACKEND_URL}/api/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward authentication headers if present
                ...(request.headers.get('authorization') && {
                    'Authorization': request.headers.get('authorization')!,
                }),
            },
            body: JSON.stringify({
                query,
                variables,
                operationName,
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend GraphQL API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Return the GraphQL response
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('❌ GraphQL request failed:', error);

        return NextResponse.json(
            {
                errors: [
                    {
                        message: 'Failed to execute GraphQL query',
                        extensions: {
                            code: 'INTERNAL_SERVER_ERROR',
                            details: error instanceof Error ? error.message : 'Unknown error',
                        },
                    },
                ],
            },
            { status: 500 }
        );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
