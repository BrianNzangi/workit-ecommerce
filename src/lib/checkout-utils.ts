// src/lib/checkout-utils.ts

import {
  CartItem,
  Coupon,
  CheckoutTotals,
  BillingData,
  ShippingData,
  Address,
  BillingFormData
} from '@/types/checkout';

export const KENYAN_COUNTIES = [
  "Nairobi", "Kiambu", "Nakuru", "Machakos", "Kisumu", "Mombasa", "Kakamega", "Kwale", "Kilifi", "Tana River", "Lamu",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Taita-Taveta", "Garissa", "Wajir",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Turkana", "West Pokot", "Kajiado", "Kericho",
  "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Narok",
  "Bomet", "Vihiga", "Bungoma", "Busia", "Siaya", "Homa Bay", "Migori", "Kisii", "Nyamira"
];

export const calculateShipping = (county: string): number => {
  return county?.toLowerCase() === 'nairobi' ? 100 : 500;
};

// Calculate shipping cost from shipping zones based on county and city
export const calculateShippingFromZones = (
  shippingZones: any[],
  county: string,
  city: string
): number => {
  if (!county || !city || !shippingZones.length) {
    return 500; // Default shipping cost
  }

  // Find the zone for the selected county
  const zone = shippingZones.find(z => z.county === county);

  if (!zone) {
    return 500; // Default if county not found
  }

  // Find the city within the zone
  const cityData = zone.cities?.find((c: any) => c.cityTown === city);

  if (cityData && cityData.price) {
    return cityData.price;
  }

  // If city not found or has no price, return default
  return 500;
};

export const calculateTotals = (
  items: CartItem[],
  shippingCost: number,
  coupon?: Coupon
): CheckoutTotals => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vat = subtotal * 0.16;
  const discount = coupon?.discount || 0;
  const total = subtotal + shippingCost + vat - discount;

  return {
    subtotal,
    shipping: shippingCost,
    vat,
    discount,
    total
  };
};

export const mapToAddress = (data: BillingData | ShippingData): Address => {
  const firstName = data.first_name?.trim() || '';
  const lastName = data.last_name?.trim() || '';

  return {
    fullName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '',
    phone: data.phone?.trim() || '',
    address: data.address_1?.trim() || '',
    city: data.city?.trim() || '',
    county: data.county?.trim() || '',
    postcode: data.postcode?.trim() || '',
    country: data.country?.trim() || 'Kenya',
  };
};

export const transformBillingData = (formData: BillingFormData, userEmail: string): BillingData => ({
  first_name: formData.firstName || '',
  last_name: formData.lastName || '',
  email: formData.email || userEmail || '',
  phone: formData.phone || '',
  county: formData.county || '',
  city: formData.city || '',
  address_1: formData.billingAddress || '',
  postcode: formData.postcode || '',
  country: formData.country || 'Kenya',
});

export const transformShippingData = (formData: BillingFormData): ShippingData => ({
  first_name: formData.firstName || '',
  last_name: formData.lastName || '',
  address_1: formData.shippingAddress || formData.billingAddress || '',
  city: formData.shippingCity || formData.city || '',
  county: formData.shippingCounty || formData.county || '',
  postcode: formData.shippingPostcode || formData.postcode || '',
  country: formData.country || 'Kenya',
  phone: formData.phone || '',
});

export const validateRequiredBillingFields = (billing: BillingData): boolean => {
  return !!(
    billing.first_name &&
    billing.last_name &&
    billing.phone &&
    billing.address_1 &&
    billing.city &&
    billing.county
  );
};

export const formatPaystackAmount = (amount: number): number => {
  return Math.round(amount * 100); // Paystack expects kobo/cents
};