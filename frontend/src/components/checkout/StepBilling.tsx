"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface BillingData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  county?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  shipToDifferentAddress?: boolean;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCounty?: string;
  [key: string]: unknown;
}

interface StepBillingProps {
  user: { id: string; name: string; email: string };
  isOpen: boolean;
  onEdit: () => void;
  onComplete: (data: any) => void; // Will send form data, not BillingData directly
  data: BillingData;
}

type BillingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  county: string;
  shippingSameAsBilling: boolean;
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCounty: string;
};

interface ShippingZone {
  id: string;
  county: string;
  cities: {
    id: string;
    cityTown: string;
    price: number;
  }[];
}

export default function StepBilling({
  user,
  isOpen,
  onEdit,
  onComplete,
  data,
}: StepBillingProps) {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<BillingFormData>({
      defaultValues: {
        firstName: "",
        lastName: "",
        email: user.email || "",
        phone: "",
        billingAddress: "",
        city: "",
        county: "",
        shippingSameAsBilling: true,
        shippingFirstName: "",
        shippingLastName: "",
        shippingPhone: "",
        shippingAddress: "",
        shippingCity: "",
        shippingCounty: "",
      },
    });

  const shippingSameAsBilling = watch("shippingSameAsBilling");
  const selectedCounty = watch("county");
  const selectedShippingCounty = watch("shippingCounty");

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

        // Extract all zones from all shipping methods
        const allZones: ShippingZone[] = [];
        result.data.forEach((method: any) => {
          if (method.zones) {
            allZones.push(...method.zones);
          }
        });

        setShippingZones(allZones);
      } catch (error) {
        console.error('Failed to fetch shipping zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };

    fetchShippingZones();
  }, []);

  // Get unique counties from shipping zones
  const availableCounties = Array.from(new Set(shippingZones.map(zone => zone.county))).sort();

  // Get cities for selected county
  const getAvailableCities = (county: string) => {
    const zone = shippingZones.find(z => z.county === county);
    return zone?.cities.map(c => c.cityTown).sort() || [];
  };

  const availableCities = selectedCounty ? getAvailableCities(selectedCounty) : [];
  const availableShippingCities = selectedShippingCounty ? getAvailableCities(selectedShippingCounty) : [];

  // Initialize form with data when component mounts or data changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Map BillingData to form structure
      setValue("firstName", data.first_name || "");
      setValue("lastName", data.last_name || "");
      setValue("email", data.email || user.email || "");
      setValue("phone", data.phone || "");
      setValue("billingAddress", data.address_1 || "");
      setValue("city", data.city || "");
      setValue("county", data.county || "");
      setValue("shippingSameAsBilling", data.shipToDifferentAddress === undefined ? true : !data.shipToDifferentAddress);
      setValue("shippingFirstName", String(data.shippingFirstName || ""));
      setValue("shippingLastName", String(data.shippingLastName || ""));
      setValue("shippingPhone", String(data.shippingPhone || ""));
      setValue("shippingAddress", data.shippingAddress || "");
      setValue("shippingCity", data.shippingCity || "");
      setValue("shippingCounty", data.shippingCounty || "");
    } else {
      // Initialize with user data if no billing data exists
      const nameParts = user.name?.split(" ") || ["", ""];
      setValue("firstName", nameParts[0] || "");
      setValue("lastName", nameParts.slice(1).join(" ") || "");
      setValue("email", user.email || "");
    }
  }, [data, setValue, user]);

  if (!isOpen) {
    const firstName = data?.first_name || "";
    const lastName = data?.last_name || "";
    const email = data?.email || "";
    const address = data?.address_1 || "";
    const city = data?.city || "";
    const county = data?.county || "";

    return (
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Billing Information</h2>
          <button onClick={onEdit} className="text-sm text-blue-600 hover:underline">Edit</button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {firstName || lastName || email || address || city || county
            ? `${firstName} ${lastName}, ${email}, ${address}, ${city}, ${county}`
            : "Not completed"}
        </p>
        {data?.shipToDifferentAddress && (
          <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
            <p className="font-medium text-gray-900 mb-1">Shipping Address:</p>
            <p>{data.shippingFirstName} {data.shippingLastName}</p>
            <p>{data.shippingPhone}</p>
            <p>{data.shippingAddress}, {data.shippingCity}, {data.shippingCounty}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onComplete)} className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold pb-4 border-b border-gray-200">Billing Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            {...register("firstName", { required: "First name is required" })}
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            {...register("lastName", { required: "Last name is required" })}
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>

        {/* Email (full width) */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            {...register("phone", { required: "Phone number is required" })}
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        {/* Billing Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Billing Address</label>
          <input
            {...register("billingAddress", { required: "Address is required" })}
            className="w-full border border-gray-200 rounded p-2 text-sm"
          />
          {errors.billingAddress && <p className="text-xs text-red-500 mt-1">{errors.billingAddress.message}</p>}
        </div>

        {/* County */}
        <div>
          <label className="block text-sm font-medium">County</label>
          <div className="relative">
            <select
              {...register("county", {
                required: "County is required",
                onChange: () => setValue("city", "") // Reset city when county changes
              })}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none pr-10"
              disabled={loadingZones}
            >
              <option value="">{loadingZones ? "Loading counties..." : "Select county"}</option>
              {availableCounties.map((county: string) => <option key={county} value={county}>{county}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          {errors.county && <p className="text-xs text-red-500 mt-1">{errors.county.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium">City/Town</label>
          <div className="relative">
            <select
              {...register("city", { required: "City is required" })}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none pr-10"
              disabled={!selectedCounty || loadingZones}
            >
              <option value="">{!selectedCounty ? "Select county first" : "Select city/town"}</option>
              {availableCities.map((city: string) => <option key={city} value={city}>{city}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>
      </div>

      {/* Shipping address is same as billing address */}
      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" {...register("shippingSameAsBilling")} className="h-4 w-4" />
        <label className="text-sm">Shipping address is same as billing address</label>
      </div>

      {/* Shipping Fields - Shown only if NOT same as billing */}
      {!shippingSameAsBilling && (
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h3 className="text-md font-medium">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping First Name */}
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                {...register("shippingFirstName", { required: !shippingSameAsBilling ? "First name is required" : false })}
                className="w-full border border-gray-200 rounded p-2 text-sm"
              />
              {errors.shippingFirstName && <p className="text-xs text-red-500 mt-1">{errors.shippingFirstName.message}</p>}
            </div>

            {/* Shipping Last Name */}
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                {...register("shippingLastName", { required: !shippingSameAsBilling ? "Last name is required" : false })}
                className="w-full border border-gray-200 rounded p-2 text-sm"
              />
              {errors.shippingLastName && <p className="text-xs text-red-500 mt-1">{errors.shippingLastName.message}</p>}
            </div>

            {/* Shipping Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Phone</label>
              <input
                {...register("shippingPhone", { required: !shippingSameAsBilling ? "Phone number is required" : false })}
                className="w-full border border-gray-200 rounded p-2 text-sm"
              />
              {errors.shippingPhone && <p className="text-xs text-red-500 mt-1">{errors.shippingPhone.message}</p>}
            </div>

            {/* Shipping Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Shipping Address</label>
              <input
                {...register("shippingAddress", { required: !shippingSameAsBilling ? "Shipping address is required" : false })}
                className="w-full border border-gray-200 rounded p-2 text-sm"
              />
              {errors.shippingAddress && <p className="text-xs text-red-500 mt-1">{errors.shippingAddress.message}</p>}
            </div>

            {/* Shipping County */}
            <div>
              <label className="block text-sm font-medium">County</label>
              <div className="relative">
                <select
                  {...register("shippingCounty", {
                    required: !shippingSameAsBilling ? "Shipping county is required" : false,
                    onChange: () => setValue("shippingCity", "") // Reset city when county changes
                  })}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none pr-10"
                  disabled={loadingZones}
                >
                  <option value="">{loadingZones ? "Loading counties..." : "Select county"}</option>
                  {availableCounties.map((county: string) => <option key={county} value={county}>{county}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {errors.shippingCounty && <p className="text-xs text-red-500 mt-1">{errors.shippingCounty.message}</p>}
            </div>

            {/* Shipping City */}
            <div>
              <label className="block text-sm font-medium">City/Town</label>
              <div className="relative">
                <select
                  {...register("shippingCity", { required: !shippingSameAsBilling ? "Shipping city is required" : false })}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none pr-10"
                  disabled={!selectedShippingCounty || loadingZones}
                >
                  <option value="">{!selectedShippingCounty ? "Select county first" : "Select city/town"}</option>
                  {availableShippingCities.map((city: string) => <option key={city} value={city}>{city}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {errors.shippingCity && <p className="text-xs text-red-500 mt-1">{errors.shippingCity.message}</p>}
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="px-4 py-2 bg-primary-900 text-white rounded text-sm hover:bg-primary-800 mt-4">
        Save & Continue
      </button>
    </form>
  );
}