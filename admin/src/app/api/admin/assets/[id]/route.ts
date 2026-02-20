import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { search } = request.nextUrl;
    return proxyRequest(request, `/catalog/assets/admin/${id}${search}`);
}
