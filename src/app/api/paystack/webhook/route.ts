import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
  const signature = req.headers.get('x-paystack-signature') || '';
  const body = await req.text();

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log('Webhook event received:', event);

  // TODO: Update order status in DB
  return NextResponse.json({ status: 'success' });
}