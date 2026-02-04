import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Missing reference or orderId" }, { status: 400 });
    }

    // ✅ Step 1: Verify payment with Paystack
    // In a production app, the backend should do this verification to prevent client-side tampering
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verifyRes.data.data;

    // ✅ Step 2: If payment successful, update order status in backend via REST
    let updatedOrder = null;
    if (paymentData.status === "success") {
      const response = await fetch(`${BACKEND_URL}/checkout/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentReference: reference,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend verification failed:', errorText);
        throw new Error(`Backend verification failed: ${response.status}`);
      }

      updatedOrder = await response.json();
    }

    // ✅ Step 3: Return both Paystack + order info
    return NextResponse.json({
      success: true,
      paymentData,
      order: updatedOrder,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error verifying Paystack payment:", err.message);
    } else {
      console.error("❌ Error verifying Paystack payment:", err);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
        details:
          err instanceof Error ? err.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}