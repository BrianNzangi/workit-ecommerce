import { create } from "zustand"
import { persist } from "zustand/middleware"
import { PaymentMethod } from "@/types/checkout"

interface Address {
  fullName: string
  phone: string
  county: string
  city: string
  address: string
  [key: string]: unknown
}

interface Coupon {
  code: string
  discount: number
}

interface CheckoutState {
  billing: Address | null
  shipping: Address | null
  sameAsBilling: boolean
  shippingMethod: string | null
  paymentMethod: PaymentMethod | null
  paymentData: { method: PaymentMethod; phoneNumber?: string } | null
  coupon?: Coupon
  activeStep: number
  setBilling: (data: Address) => void
  setShipping: (data: Address) => void
  toggleSameAsBilling: () => void
  setShippingMethod: (method: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setPaymentData: (data: { method: PaymentMethod; phoneNumber?: string }) => void
  setCoupon: (coupon: Coupon) => void
  setActiveStep: (step: number) => void
  resetCheckout: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      billing: null,
      shipping: null,
      sameAsBilling: true,
      shippingMethod: null,
      paymentMethod: null,
      paymentData: null,
      coupon: undefined,
      activeStep: 1,

      setBilling: (data: Address) => set({ billing: data }),
      setShipping: (data: Address) => set({ shipping: data }),
      toggleSameAsBilling: () =>
        set((state) => ({ sameAsBilling: !state.sameAsBilling })),
      setShippingMethod: (method: string) => set({ shippingMethod: method }),
      setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),
      setPaymentData: (data: { method: PaymentMethod; phoneNumber?: string }) => set({ paymentData: data }),
      setCoupon: (coupon: Coupon) => set({ coupon }),
      setActiveStep: (step: number) => set({ activeStep: step }),
      resetCheckout: () =>
        set({
          billing: null,
          shipping: null,
          sameAsBilling: true,
          shippingMethod: null,
          paymentMethod: null,
          paymentData: null,
          coupon: undefined,
          activeStep: 1,
        }),
    }),
    {
      name: "checkout-storage",
      // Persist all relevant checkout data
      partialize: (state) => ({
        billing: state.billing,
        shipping: state.shipping,
        sameAsBilling: state.sameAsBilling,
        shippingMethod: state.shippingMethod,
        paymentMethod: state.paymentMethod,
        paymentData: state.paymentData,
        activeStep: state.activeStep,
      }),
    }
  )
)
