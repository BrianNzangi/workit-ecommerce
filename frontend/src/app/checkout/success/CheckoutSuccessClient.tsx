"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useCartStore } from "@/store/cartStore";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const trxRef = searchParams.get('trxref');
    const reference = searchParams.get('reference');
    const orderId = searchParams.get('orderId');

    console.log('[CheckoutSuccess] IDs from URL:', { trxRef, reference, orderId });

    if (!orderId) {
      console.log('[CheckoutSuccess] Missing orderId, aborting');
      setStatus('failed'); // Changed from 'error' to 'failed' to match existing status types
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log('[CheckoutSuccess] Calling verify endpoint...');
        // Verify payment with Paystack API route
        const response = await fetch(`/api/paystack/verify?reference=${reference || trxRef}&orderId=${orderId}`, {
          method: 'GET',
        });

        const data = await response.json();
        console.log('[CheckoutSuccess] Verify response:', data);

        if (response.ok) {
          setStatus('success');
          // Clear cart on success
          clearCart();
        } else {
          console.error('Payment verification failed:', data);
          setStatus('failed'); // Changed from 'error' to 'failed' to match existing status types
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed'); // Changed from 'error' to 'failed' to match existing status types
      }
    };

    if (reference || trxRef) {
      // If we have a reference, verify with backend
      verifyPayment();
    } else {
      // If no payment reference but have orderId (e.g. COD or manual flow?)
      // For now, assume success if here? Or maybe we require payment ref?
      // existing code logic...
      console.log('[CheckoutSuccess] No payment reference found');
      setStatus('success');
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center font-sans px-4">
      {status === "loading" && (
        <>
          <Loader2 className="animate-spin text-blue-600 mb-4" size={64} />
          <h1 className="text-xl font-semibold mb-2">Verifying your payment...</h1>
          <p className="text-muted-foreground">Please wait a moment while we confirm your order.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="text-green-600 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Thank you for your purchase. A confirmation email has been sent. You can track your order in your account.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard?section=orders">
              <Button className="bg-[#1F2323] text-white">View My Orders</Button>
            </Link>
            <Link href="/">
              <Button className="bg-[#0046BE] text-white">Back to Home</Button>
            </Link>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="text-red-600 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn’t verify your payment. If you were charged, please contact support with your transaction reference.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/checkout">
              <Button className="bg-[#1F2323] text-white">Try Again</Button>
            </Link>
            <Link href="/">
              <Button className="bg-[#0046BE] text-white">Back to Home</Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
