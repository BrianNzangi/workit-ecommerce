import { create } from "zustand"
import { persist } from "zustand/middleware"

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
  paymentMethod: string | null
  paymentData: { method: string; phoneNumber?: string } | null
  coupon?: Coupon;
  setBilling: (data: Address) => void
  setShipping: (data: Address) => void
  toggleSameAsBilling: () => void
  setShippingMethod: (method: string) => void
  setPaymentMethod: (method: string) => void
  setPaymentData: (data: { method: string; phoneNumber?: string }) => void
  setCoupon: (coupon: Coupon) => void
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

      setBilling: (data) => set({ billing: data }),
      setShipping: (data) => set({ shipping: data }),
      toggleSameAsBilling: () =>
        set((state) => ({ sameAsBilling: !state.sameAsBilling })),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentData: (data) => set({ paymentData: data }),
      setCoupon: (coupon) => set({ coupon }),
      resetCheckout: () =>
        set({
          billing: null,
          shipping: null,
          sameAsBilling: true,
          shippingMethod: null,
          paymentMethod: null,
          paymentData: null,
          coupon: undefined,
        }),
    }),
    {
      name: "checkout-storage",
      // Only persist billing and shipping data, not payment or methods
      partialize: (state) => ({
        billing: state.billing,
        shipping: state.shipping,
        sameAsBilling: state.sameAsBilling,
      }),
    }
  )
)
