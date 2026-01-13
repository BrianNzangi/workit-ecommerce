// src/app/api/customer/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET() {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Return mock billing information for now, eliminating WooCommerce dependency
    // In a real implementation, you would fetch this from your new backend
    const billingData = {
      first_name: user.firstName || '',
      last_name: user.lastName || '',
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
    const { user } = await withAuth();

    if (!user) {
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

    // Return the updated data (mock update)
    const updatedBillingData = {
      first_name: billing.first_name,
      last_name: billing.last_name,
      email: billing.email,
      phone: billing.phone,
      address_1: billing.address_1,
      city: billing.city,
      county: billing.county,
      postcode: billing.postcode,
      country: billing.country,
    };

    return NextResponse.json({
      success: true,
      billing: updatedBillingData,
    });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update customer data',
    }, { status: 500 });
  }
}
