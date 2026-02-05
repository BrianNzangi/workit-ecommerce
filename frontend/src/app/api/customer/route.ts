import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { user } = session;
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    const headerList = await headers();

    // Fetch customer profile from backend
    const customerRes = await fetch(`${BACKEND_URL}/identity/customers/me`, {
      headers: {
        'cookie': headerList.get('cookie') || '',
      }
    });

    // Fetch addresses from backend
    const addressRes = await fetch(`${BACKEND_URL}/identity/customers/me/addresses`, {
      headers: {
        'cookie': headerList.get('cookie') || '',
      }
    });

    const customerData = await customerRes.json();
    const addressData = await addressRes.json();

    // Get the first address as the default billing address if available
    const primaryAddress = addressData.addresses?.[0] || {};

    const billingData = {
      first_name: customerData.firstName || user.name?.split(' ')[0] || '',
      last_name: customerData.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: customerData.email || user.email || '',
      phone: primaryAddress.phoneNumber || '',
      address_1: primaryAddress.streetLine1 || '',
      city: primaryAddress.city || '',
      county: primaryAddress.province || '',
      postcode: primaryAddress.postalCode || '',
      country: primaryAddress.country || 'Kenya',
    };

    return NextResponse.json({
      success: true,
      billing: billingData,
    });
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customer data',
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const body = await request.json();
    const { billing } = body;

    if (!billing) {
      return NextResponse.json({
        success: false,
        error: 'Billing data is required',
      }, { status: 400 });
    }

    // Update user via Better Auth
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: `${billing.first_name} ${billing.last_name}`.trim(),
        firstName: billing.first_name,
        lastName: billing.last_name,
      } as any
    });

    return NextResponse.json({
      success: true,
      billing,
    });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update customer data',
    }, { status: 500 });
  }
}
