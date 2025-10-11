// src/components/checkout/CheckoutClient.tsx

'use client';

import StepBilling from './StepBilling';
import StepShipping from './StepShipping';
import StepPayment from './StepPayment';
import OrderSummary from './OrderSummary';
import { useCheckout } from '@/hooks/useCheckout';
import { User } from '@/types/checkout';

interface CheckoutClientProps {
  user: User;
}

// Paystack global type declaration (for dynamic loading)
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const {
    stepData,
    activeStep,
    loading,
    setActiveStep,
    handleBillingSubmit,
    handleShippingSubmit,
    handlePaymentSubmit,
    handlePlaceOrder,
    coupon,
  } = useCheckout(user);

  const isOrderReady =
    stepData.billing.first_name &&
    stepData.billing.last_name &&
    stepData.payment?.method &&
    activeStep >= 3 && // Payment step must be completed
    !loading;

  return (
    <section className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 font-[DM_SANS]">
      <div className="md:col-span-2 space-y-6">
        <StepBilling
          user={user}
          isOpen={activeStep === 1}
          onEdit={() => setActiveStep(1)}
          onComplete={handleBillingSubmit}
          data={stepData.billing}
        />

        <StepShipping
          billingData={stepData.billing.shipToDifferentAddress ? stepData.shipping : stepData.billing}
          isOpen={activeStep === 2}
          onEdit={() => setActiveStep(2)}
          onComplete={handleShippingSubmit}
          data={stepData.shipping}
        />

        <StepPayment
          isOpen={activeStep === 3}
          onEdit={() => setActiveStep(3)}
          onComplete={handlePaymentSubmit}
          data={stepData.payment}
        />
      </div>

      <div>
        <OrderSummary
          shipping={stepData.totals.shipping}
          vatRate={0.16}
          coupon={coupon}
        />
        
        <button
          onClick={handlePlaceOrder}
          disabled={!isOrderReady}
          className={`
            mt-6 w-full py-3 rounded-lg text-white font-medium transition-colors
            ${isOrderReady 
              ? 'bg-[#0046BE] hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>

        {/* Payment method instructions */}
        {stepData.payment.method && activeStep >= 3 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">
              💳 You will be redirected to Paystack to complete your payment securely.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
