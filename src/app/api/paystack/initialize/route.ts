import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount }: { email: string; amount: number } = body;

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    const res = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: amount * 100 }, // Paystack expects amount in kobo
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Paystack initialize error:', err.message);
    } else {
      console.error('Paystack initialize error:', err);
    }

    return NextResponse.json(
      { error: 'Failed to initialize transaction' },
      { status: 500 }
    );
  }
}