"use client";

import StepBilling from "@/components/checkout/StepBilling";
import StepShipping from "@/components/checkout/StepShipping";
import StepPayment from "@/components/checkout/StepPayment";
import { PaymentFormData } from "@/types/checkout";

interface CheckoutStepsProps {
  user: { id: string; name: string; email: string };
  stepData: {
    billing: { county?: string; [key: string]: any };
    shipping: { [key: string]: any };
    payment: PaymentFormData;
  };
  setStepData: React.Dispatch<React.SetStateAction<any>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function CheckoutSteps({
  user,
  stepData,
  setStepData,
  activeStep,
  setActiveStep,
}: CheckoutStepsProps) {
  return (
    <div className="space-y-4">
      {/* Step 1: Billing */}
      <StepBilling
        user={user}
        isOpen={activeStep === 1}
        onEdit={() => setActiveStep(1)}
        onComplete={(data: any) => {
          setStepData((prev: any) => ({ ...prev, billing: data }));
          setActiveStep(2);
        }}
        data={stepData.billing}
      />

      {/* Step 2: Shipping */}
      <StepShipping
        isOpen={activeStep === 2}
        onEdit={() => setActiveStep(2)}
        onComplete={(data: any) => {
          setStepData((prev: any) => ({ ...prev, shipping: data }));
          setActiveStep(3);
        }}
        data={stepData.shipping}
        billingData={stepData.billing} 
      />

      {/* Step 3: Payment */}
      <StepPayment
        isOpen={activeStep === 3}
        onEdit={() => setActiveStep(3)}
        onComplete={(data: any) => {
          setStepData((prev: any) => ({ ...prev, payment: data }));
        }}
        data={stepData.payment}
      />
    </div>
  );
}
