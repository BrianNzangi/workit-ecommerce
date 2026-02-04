"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

interface StepShippingProps {
  billingData: { county?: string; city?: string };
  isOpen: boolean;
  onEdit: () => void;
  onComplete: (data: any) => void;
  data: any;
}

type ShippingFormData = {
  method: "standard" | "express" | "pickup";
  price: number;
};

interface ShippingZone {
  id: string;
  county: string;
  cities: {
    id: string;
    cityTown: string;
    standardPrice: number;
    expressPrice?: number | null;
  }[];
}

export default function StepShipping({
  billingData,
  isOpen,
  onEdit,
  onComplete,
  data,
}: StepShippingProps) {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    defaultValues: data || { method: "standard", price: 0 },
  });

  const selectedMethod = watch("method");

  // Fetch shipping zones from API
  useEffect(() => {
    const fetchShippingZones = async () => {
      try {
        setLoadingZones(true);
        const response = await fetch('/api/shipping-zones');
        const result = await response.json();

        if (!result.success) {
          console.error('Failed to fetch shipping zones:', result.error);
          return;
        }

        // Extract all zones from different possible response structures
        const allZones: ShippingZone[] = [];
        if (Array.isArray(result.data)) {
          result.data.forEach((item: any) => {
            if (item.zones && Array.isArray(item.zones)) {
              // It's a method with nested zones
              allZones.push(...item.zones);
            } else if (item.county || item.cities) {
              // It's a zone directly
              allZones.push(item);
            }
          });
        }

        setShippingZones(allZones);
      } catch (error) {
        console.error('Failed to fetch shipping zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };

    fetchShippingZones();
  }, []);

  // Get pricing for selected city
  const getCityPricing = () => {
    if (!billingData?.county || !billingData?.city) {
      return { standardPrice: 0, expressPrice: null };
    }

    // A city might be in multiple zones (one for each method)
    // We look for any city record that matches the name in a zone matching the county
    const zones = shippingZones.filter(z => z.county === billingData.county);
    let standardPrice = 0;
    let expressPrice: number | null = null;

    for (const zone of zones) {
      const city = zone.cities.find(c => c.cityTown === billingData.city);
      if (city) {
        // Divide by 100 as backend stores cents (e.g. 40000 -> 400 KES)
        standardPrice = city.standardPrice / 100;
        expressPrice = city.expressPrice ? city.expressPrice / 100 : null;
        break;
      }
    }

    return { standardPrice, expressPrice };
  };

  const { standardPrice, expressPrice } = getCityPricing();
  const hasExpressOption = expressPrice !== null && expressPrice !== undefined;

  // Update price when method changes
  useEffect(() => {
    if (selectedMethod === "standard") {
      setValue("price", standardPrice);
    } else if (selectedMethod === "express" && hasExpressOption) {
      setValue("price", expressPrice);
    } else if (selectedMethod === "pickup") {
      setValue("price", 0);
    }
  }, [selectedMethod, standardPrice, expressPrice, hasExpressOption, setValue]);

  // Persist values if data changes
  useEffect(() => {
    if (data) {
      Object.keys(data).forEach((key) => {
        setValue(key as keyof ShippingFormData, data[key]);
      });
    }
  }, [data, setValue]);

  if (!isOpen) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Shipping Method</h2>
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {data
            ? data.method === "standard"
              ? `Standard Shipping — KES ${data.price || standardPrice}`
              : data.method === "express"
                ? `Express Shipping — KES ${data.price || expressPrice}`
                : `Store Pickup — Free`
            : "Not selected"}
        </p>
      </div>
    );
  }

  // Show message if no city selected
  if (!billingData?.city || !billingData?.county) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2 pb-4 border-b border-gray-200">Shipping Method</h2>
        <p className="text-sm text-gray-500">
          Please complete the billing information and select a city to see available shipping options.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onComplete)}
      className="bg-white border border-gray-100 rounded-lg p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold pb-4 border-b border-gray-200">Shipping Method</h2>

      {loadingZones ? (
        <p className="text-sm text-gray-500">Loading shipping options...</p>
      ) : (
        <div className="space-y-3">
          {/* Standard Shipping Option */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
            <input
              type="radio"
              value="standard"
              {...register("method", { required: "Select a shipping method" })}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Standard Shipping</span>
                <span className="text-sm font-bold">KES {standardPrice}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Delivery in 3-5 business days</p>
            </div>
          </label>

          {/* Express Shipping Option */}
          <label
            className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg transition-colors ${hasExpressOption
              ? "hover:border-blue-500 cursor-pointer"
              : "opacity-50 cursor-not-allowed bg-gray-50"
              }`}
          >
            <input
              type="radio"
              value="express"
              {...register("method", { required: "Select a shipping method" })}
              disabled={!hasExpressOption}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Express Shipping</span>
                <span className="text-sm font-bold">
                  {hasExpressOption ? `KES ${expressPrice}` : "Not available"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {hasExpressOption
                  ? "Delivery in 1-2 business days"
                  : "Express delivery not available for this location"}
              </p>
            </div>
          </label>

          {/* Store Pickup Option */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
            <input
              type="radio"
              value="pickup"
              {...register("method", { required: "Select a shipping method" })}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Store Pickup</span>
                <span className="text-sm font-bold">FREE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pick up at Workit Store - Nairobi CBD</p>
            </div>
          </label>
        </div>
      )}

      {errors.method && (
        <p className="text-xs text-red-500">{errors.method.message}</p>
      )}

      <button
        type="submit"
        className="px-4 py-2 bg-primary-900 text-white rounded text-sm hover:bg-primary-800"
      >
        Save & Continue
      </button>
    </form>
  );
}
