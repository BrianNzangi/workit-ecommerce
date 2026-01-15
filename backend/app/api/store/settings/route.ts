import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const settings = await (prisma as any).setting.findMany({
            select: {
                key: true,
                value: true,
            },
            // Safely filter public configuration only.
            // We explicitly exclude sensitive keys like 'secret', 'password', 'key' etc if they are part of the key name
            // logic is better handled by an allow-list or explicit block-list in code if the schema doesn't support it.
            // For now, let's just return general store settings and avoid payment/admin keys if possible
            // or rely on frontend to pick what it needs, but backend filtering is safer.

            // Since the current schema stores everything in rows, we'll fetch all and filter in memory for safety
            // before returning to public.
        });

        const settingsMap = settings.reduce((acc: Record<string, any>, setting: any) => {
            // Simple security filter: don't expose keys containing 'Secret' or 'Key' or 'Private'
            // UNLESS it is explicitly public (e.g. valid public keys).
            // Adjust this logic based on actual needs.

            // However, for the storefront, we generally need basic info.
            // Let's rely on a safe allow-list approach for the public API to be secure by default.

            const safePrefixes = ['general.', 'policies.', 'shipping.', 'taxes.', 'roles.']; // roles? probably not public. Remove roles.
            // Actually, roles shouldn't be exposed to store.

            const isSafe = (
                setting.key.startsWith('general.') ||
                setting.key.startsWith('policies.') ||
                setting.key.startsWith('shipping.') ||
                setting.key.startsWith('taxes.') ||
                setting.key === 'payments.default_currency' ||
                setting.key === 'payments.paystack_public_key' ||
                setting.key === 'payments.paystack_enabled'
                // Exclude api keys and client ids from public store API for now
            );

            if (isSafe && !setting.key.toLowerCase().includes('secret')) {
                acc[setting.key] = setting.value;
            }

            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("Error fetching store settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch store settings" },
            { status: 500 }
        );
    }
}
