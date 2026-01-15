import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // ✅ Step 1: Verify payment with Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verifyRes.data.data;

    // ✅ Step 2: If payment successful, update order status to PAYMENT_SETTLED
    let updatedOrder = null;
    if (paymentData.status === "success" && orderId) {
      const mutation = `
        mutation UpdateOrderStatus($id: ID!, $state: OrderState!) {
          updateOrderStatus(id: $id, state: $state) {
            id
            code
            state
            total
          }
        }
      `;

      const response = await fetch(`${BACKEND_URL}/api/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id: orderId,
            state: 'PAYMENT_SETTLED'
          },
        }),
      });

      const result = await response.json();

      if (result.data?.updateOrderStatus) {
        updatedOrder = result.data.updateOrderStatus;
      }
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