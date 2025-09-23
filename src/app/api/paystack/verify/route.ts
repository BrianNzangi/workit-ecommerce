import { NextResponse } from "next/server";
import axios from "axios";
import woo from "@/lib/woocommerce";

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

    // ✅ Step 2: If payment successful, update WooCommerce order
    let updatedOrder = null;
    if (paymentData.status === "success" && orderId) {
      const orderRes = await woo.put(`/orders/${orderId}`, {
        set_paid: true,
        status: "processing",
        transaction_id: reference,
      });
      updatedOrder = orderRes.data;
    }

    // ✅ Step 3: Return both Paystack + Woo order info
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