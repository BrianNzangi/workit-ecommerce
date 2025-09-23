"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface StepShippingProps {
  billingData: { county?: string };
  isOpen: boolean;
  onEdit: () => void;
  onComplete: (data: any) => void;
  data: any;
}

type ShippingFormData = {
  method: "cbd" | "outside_cbd" | "outside_nairobi";
};

export default function StepShipping({
  billingData,
  isOpen,
  onEdit,
  onComplete,
  data,
}: StepShippingProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormData>({
    defaultValues: data || { method: "cbd" },
  });

  // ✅ Persist values if data changes (avoid infinite re-renders)
  useEffect(() => {
    if (data) {
      Object.keys(data).forEach((key) => {
        setValue(key as keyof ShippingFormData, data[key]);
      });
    }
  }, [data, setValue]);

  const county = billingData?.county?.toLowerCase() || "";
  const isNairobi = county === "nairobi";

  if (!isOpen) {
    return (
      <div className="border border-gray-100 rounded-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Shipping Method</h2>
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {data
            ? data.method === "cbd"
              ? "Delivery within Nairobi CBD @ KES 100"
              : data.method === "outside_cbd"
              ? "Delivery within Nairobi (outside CBD) — cost depends on distance"
              : "Outside Nairobi via Wells Fargo (rate varies)"
            : "Not selected"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onComplete)}
      className="border border-gray-100 rounded-sm p-4 space-y-4"
    >
      <h2 className="text-lg font-semibold">Shipping Method</h2>

      <div className="space-y-3">
        {isNairobi ? (
          <>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cbd"
                {...register("method", { required: "Select a shipping method" })}
              />
              <span className="text-sm">
                Nairobi CBD — <strong>KES 100</strong>
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="outside_cbd"
                {...register("method", { required: "Select a shipping method" })}
              />
              <span className="text-sm">
                Outside Nairobi CBD (within Nairobi) — cost depends on distance
              </span>
            </label>
          </>
        ) : (
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="outside_nairobi"
              {...register("method", { required: "Select a shipping method" })}
            />
            <span className="text-sm">
              Outside Nairobi — Wells Fargo (rate varies)
            </span>
          </label>
        )}
      </div>

      {errors.method && (
        <p className="text-xs text-red-500">{errors.method.message}</p>
      )}

      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
      >
        Save & Continue
      </button>
    </form>
  );
}
