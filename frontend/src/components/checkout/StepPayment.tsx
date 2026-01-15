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
    defaultValues: data || { method: "card", phoneNumber: "" },
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
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-4">
          <p>
            {data
              ? data.method === "mpesa"
                ? "M-Pesa"
                : data.method === "airtel"
                  ? "Airtel Money"
                  : "Credit / Debit Card"
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
      className="bg-white border border-gray-100 rounded-lg p-6 space-y-6"
    >
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
        <p className="text-sm text-gray-600">
          All payments are securely processed through Paystack
        </p>
      </div>

      <div className="space-y-4">
        {/* Card Payment Option */}
        <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === "card" ? "border-primary-900 bg-primary-50" : "border-gray-200 hover:border-gray-300"
          }`}>
          <input
            type="radio"
            value="card"
            {...register("method", { required: "Select a payment method" })}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="font-medium">Pay Now with Credit / Debit Card</span>
            <p className="text-xs text-gray-600 mt-1">
              Pay with Visa, Mastercard, or Verve
            </p>
          </div>
        </label>

        {/* M-Pesa Option */}
        <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === "mpesa" ? "border-primary-900 bg-primary-50" : "border-gray-200 hover:border-gray-300"
          }`}>
          <input
            type="radio"
            value="mpesa"
            {...register("method", { required: "Select a payment method" })}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="font-medium">Pay Now with M-Pesa</span>
            <p className="text-xs text-gray-600 mt-1">
              Pay directly from your M-Pesa account
            </p>
          </div>
        </label>

        {/* Airtel Money Option */}
        <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === "airtel" ? "border-primary-900 bg-primary-50" : "border-gray-200 hover:border-gray-300"
          }`}>
          <input
            type="radio"
            value="airtel"
            {...register("method", { required: "Select a payment method" })}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="font-medium">Pay Now with Airtel Money</span>
            <p className="text-xs text-gray-600 mt-1">
              Pay directly from your Airtel Money account
            </p>
          </div>
        </label>
      </div>

      {errors.method && (
        <p className="text-xs text-red-500">{errors.method.message}</p>
      )}

      {/* Phone number field for mobile money */}
      {(selectedMethod === "mpesa" || selectedMethod === "airtel") && (
        <div className="bg-gray-50 p-4 rounded-lg">
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
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-900 focus:border-transparent"
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            You'll receive a prompt on your phone to complete the payment
          </p>
        </div>
      )}

      <button
        type="submit"
        className="px-6 py-3 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
      >
        Continue to Review Order
      </button>
    </form>
  );
}

export type { PaymentMethod, PaymentFormData };
