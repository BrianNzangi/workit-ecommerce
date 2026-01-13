// src/types/checkout.ts

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface BillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  county: string;
  city: string;
  address_1: string;
  postcode: string;
  country: string;
  [key: string]: unknown;
}

export interface ShippingData {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  phone: string;
  [key: string]: unknown;
}

export type PaymentMethod = "mpesa" | "airtel" | "card";

export interface PaymentData {
  method: PaymentMethod;
  phoneNumber?: string; // For M-Pesa/Airtel
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Coupon {
  code: string;
  discount: number;
}

export interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  vat: number;
  discount: number;
  total: number;
}

export interface OrderResponse {
  success: boolean;
  order?: { id: string; total: string };
  error?: string;
}

export interface PaystackResponse {
  trxref: string;
  reference: string;
}

export interface StepData {
  billing: BillingData;
  shipping: ShippingData;
  payment: PaymentData;
  items: CartItem[];
  totals: CheckoutTotals;
  customer: User;
}

// Form data types for each step
export interface BillingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  shipToDifferentAddress: boolean;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCounty?: string;
  shippingPostcode?: string;
}

export interface PaymentFormData {
  method: PaymentMethod;
  phoneNumber?: string;
}

export interface ShippingFormData {
  method: "standard" | "express";
  price?: number;
}