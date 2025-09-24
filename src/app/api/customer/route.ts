// src/app/api/customer/route.ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { updateWooCommerceCustomerBilling, getOrCreateWooCommerceCustomer } from '@/lib/woocommerce';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Get or create WooCommerce customer
    const customer = await getOrCreateWooCommerceCustomer(
      userId,
      {
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: '',
      }
    );

    // Return billing information
    const billingData = {
      first_name: customer.billing.first_name || customer.first_name,
      last_name: customer.billing.last_name || customer.last_name,
      email: customer.billing.email || customer.email,
      phone: customer.billing.phone || '',
      address_1: customer.billing.address_1 || '',
      city: customer.billing.city || '',
      county: customer.billing.state || '',
      postcode: customer.billing.postcode || '',
      country: customer.billing.country || 'Kenya',
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
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
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

    // Get or create WooCommerce customer
    const customer = await getOrCreateWooCommerceCustomer(
      userId,
      {
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: billing.first_name || user.firstName || '',
        lastName: billing.last_name || user.lastName || '',
        phone: billing.phone || '',
      }
    );

    // Update billing information
    const updatedCustomer = await updateWooCommerceCustomerBilling(customer.id, {
      first_name: billing.first_name,
      last_name: billing.last_name,
      email: billing.email,
      phone: billing.phone,
      address_1: billing.address_1,
      city: billing.city,
      state: billing.county,
      postcode: billing.postcode,
      country: billing.country,
    });

    // Return updated billing information
    const updatedBillingData = {
      first_name: updatedCustomer.billing.first_name || updatedCustomer.first_name,
      last_name: updatedCustomer.billing.last_name || updatedCustomer.last_name,
      email: updatedCustomer.billing.email || updatedCustomer.email,
      phone: updatedCustomer.billing.phone || '',
      address_1: updatedCustomer.billing.address_1 || '',
      city: updatedCustomer.billing.city || '',
      county: updatedCustomer.billing.state || '',
      postcode: updatedCustomer.billing.postcode || '',
      country: updatedCustomer.billing.country || 'Kenya',
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
