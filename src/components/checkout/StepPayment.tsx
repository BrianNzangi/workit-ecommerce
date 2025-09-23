// src/components/checkout/StepPayment.tsx

"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { PaymentMethod, PaymentFormData } from '@/types/checkout';

interface StepPaymentProps {
  isOpen: boolean;
  onEdit: () => void;
  onComplete: (data: PaymentFormData) => void;
  data?: PaymentFormData;
}

export default function StepPayment({
  isOpen,
  onEdit,
  onComplete,
  data,
}: StepPaymentProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: data || { method: "mpesa", phoneNumber: "" },
  });

  const selectedMethod = watch("method");

  useEffect(() => {
    if (data) {
      setValue("method", data.method);
      if (data.phoneNumber) {
        setValue("phoneNumber", data.phoneNumber);
      }
    }
  }, [data, setValue]);

  if (!isOpen) {
    return (
      <div className="border border-gray-100 rounded-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <p>
            {data
              ? data.method === "mpesa"
                ? "M-Pesa"
                : data.method === "airtel"
                ? "Airtel Money"
                : "Credit / Debit Card (Paystack)"
              : "Not selected"}
          </p>
          {data?.phoneNumber && (data.method === "mpesa" || data.method === "airtel") && (
            <p className="text-xs text-gray-500">Phone: {data.phoneNumber}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onComplete)}
      className="border border-gray-100 rounded-lg p-4 space-y-4"
    >
      <h2 className="text-lg font-semibold">Payment Method</h2>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="mpesa"
            {...register("method", { required: "Select a payment method" })}
          />
          <span className="text-sm">M-Pesa</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="airtel"
            {...register("method", { required: "Select a payment method" })}
          />
          <span className="text-sm">Airtel Money</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="card"
            {...register("method", { required: "Select a payment method" })}
          />
          <span className="text-sm">Credit / Debit Card (Paystack)</span>
        </label>
      </div>

      {errors.method && (
        <p className="text-xs text-red-500">{errors.method.message}</p>
      )}

      {/* Phone number field for mobile money */}
      {(selectedMethod === "mpesa" || selectedMethod === "airtel") && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            {selectedMethod === "mpesa" ? "M-Pesa" : "Airtel Money"} Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g., 0712345678"
            {...register("phoneNumber", {
              required: `Phone number is required for ${selectedMethod === "mpesa" ? "M-Pesa" : "Airtel Money"}`,
              pattern: {
                value: /^(?:254|\+254|0)?[17]\d{8}$/,
                message: "Please enter a valid Kenyan phone number"
              }
            })}
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>
      )}

      {/* Payment method information */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-xs text-gray-600">
          You will be redirected to Paystack to complete your payment securely.
        </p>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
      >
        Save & Continue
      </button>
    </form>
  );
}

export type { PaymentMethod, PaymentFormData };
