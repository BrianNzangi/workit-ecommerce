import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    // Return billing information from the user record
    const billingData = {
      first_name: (user as any).firstName || user.name?.split(' ')[0] || '',
      last_name: (user as any).lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: '',
      address_1: '',
      city: '',
      county: '',
      postcode: '',
      country: 'Kenya',
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
