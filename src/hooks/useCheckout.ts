import { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCartStore } from '@/store/cartStore';
import {
  StepData,
  ShippingData,
  PaymentData,
  User,
  OrderResponse,
  PaystackResponse,
  BillingFormData,
  PaymentFormData
} from '@/types/checkout';
import {
  calculateShipping,
  calculateShippingFromZones,
  calculateTotals,
  mapToAddress,
  transformBillingData,
  transformShippingData,
  validateRequiredBillingFields,
  formatPaystackAmount
} from '@/lib/checkout-utils';

export const useCheckout = (user: User) => {
  const {
    billing,
    shipping,
    sameAsBilling,
    paymentMethod,
    coupon,
    setBilling,
    setShipping,
    setPaymentMethod,
    setPaymentData,
  } = useCheckoutStore();

  const { items, clearCart } = useCartStore();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingZones, setShippingZones] = useState<any[]>([]);

  // Initialize stepData with proper default values
  const [stepData, setStepData] = useState<StepData>({
    billing: {
      first_name: '',
      last_name: '',
      email: user.email || '',
      phone: '',
      county: '',
      city: '',
      address_1: '',
      postcode: '',
      country: 'Kenya',
    },
    shipping: {
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'Kenya',
      phone: '',
    },
    payment: { method: 'mpesa' },
    items: [],
    totals: {
      subtotal: 0,
      shipping: 0,
      vat: 0,
      discount: 0,
      total: 0
    },
    customer: user,
  });

  // Fetch shipping zones
  useEffect(() => {
    const fetchShippingZones = async () => {
      try {
        const response = await fetch('/api/shipping-zones');
        const result = await response.json();

        if (result.success) {
          // Extract all zones from all shipping methods
          const allZones: any[] = [];
          result.data.forEach((method: any) => {
            if (method.zones) {
              allZones.push(...method.zones);
            }
          });
          setShippingZones(allZones);
        }
      } catch (error) {
        console.error('Failed to fetch shipping zones:', error);
      }
    };

    fetchShippingZones();
  }, []);

  // Update totals & step data when dependencies change
  useEffect(() => {
    // Use existing shipping cost from state, or default to 0
    // This ensures shipping is 0 until a method is explicitly selected
    const payment: PaymentData = {
      method: paymentMethod === 'mpesa' || paymentMethod === 'airtel' || paymentMethod === 'card'
        ? paymentMethod
        : 'mpesa',
    };

    setStepData(prev => {
      // Use existing shipping cost from state, or default to 0
      // This ensures shipping is 0 until a method is explicitly selected
      const shippingCost = prev.totals.shipping || 0;
      const totals = calculateTotals(items, shippingCost, coupon);

      return {
        ...prev,
        billing: billing ? {
          first_name: billing.fullName?.split(' ')[0] || '',
          last_name: billing.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: billing.phone || '',
          county: billing.county || '',
          city: billing.city || '',
          address_1: billing.address || '',
          postcode: String(billing.postcode || ''),
          country: String(billing.country || 'Kenya'),
        } : prev.billing,
        shipping: shipping ? {
          first_name: shipping.fullName?.split(' ')[0] || '',
          last_name: shipping.fullName?.split(' ').slice(1).join(' ') || '',
          address_1: shipping.address || '',
          address_2: '',
          city: shipping.city || '',
          county: shipping.county || '',
          postcode: String(shipping.postcode || ''),
          country: String(shipping.country || 'Kenya'),
          phone: shipping.phone || '',
        } : prev.shipping,
        payment,
        items,
        totals,
        customer: user,
      };
    });
  }, [billing, shipping, paymentMethod, items, coupon, user]);

  const handleBillingSubmit = (formData: BillingFormData) => {
    const billingData = transformBillingData(formData, user.email);
    const address = mapToAddress(billingData);

    setBilling(address as any);

    if (sameAsBilling || formData.shipToDifferentAddress === false) {
      setShipping(address as any);
    } else if (formData.shipToDifferentAddress) {
      const shippingData = transformShippingData(formData);
      const shippingAddress = mapToAddress(shippingData);
      setShipping(shippingAddress as any);
    }

    setStepData((prev) => ({ ...prev, billing: billingData }));
    setActiveStep(2);
  };

  const handleShippingSubmit = (data: any) => {
    // Store shipping method and price
    setStepData((prev) => ({
      ...prev,
      shipping: data,
      totals: {
        ...prev.totals,
        shipping: data.price || 0
      }
    }));
    setActiveStep(3);
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentMethod(data.method);
    setPaymentData({ method: data.method, phoneNumber: data.phoneNumber });
    setStepData((prev) => ({
      ...prev,
      payment: { method: data.method, phoneNumber: data.phoneNumber }
    }));
    setActiveStep(4); // Move to final step after payment is saved
  };

  const createOrder = async (): Promise<{ id: string; total: string }> => {
    const orderRes = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: user,
        items,
        billing: stepData.billing,
        shipping: stepData.shipping,
        payment: stepData.payment,
        totals: stepData.totals
      }),
    });

    const orderData: OrderResponse = await orderRes.json();

    if (!orderData.success) {
      throw new Error(orderData.error || "Order creation failed");
    }

    if (!orderData.order) {
      throw new Error("Order not found");
    }

    return orderData.order;
  };

  const processPaystackPayment = async (order: { id: string; total: string }) => {
    const amount = formatPaystackAmount(parseFloat(order.total));

    return new Promise<void>((resolve, reject) => {
      // Dynamically load Paystack script
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        const paystack = (window as any).PaystackPop;
        if (!paystack) {
          reject(new Error("Paystack script failed to load"));
          return;
        }

        // Prepare Paystack config
        const config: any = {
          key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
          email: stepData.billing.email || user.email,
          amount,
          currency: "KES",
          ref: `order-${order.id}-${Date.now()}`,
          onClose: () => {
            setLoading(false);
            reject(new Error("Payment popup closed"));
          },
          callback: (response: PaystackResponse) => {
            clearCart();
            window.location.href = `/checkout/success?trxref=${response.trxref}&reference=${response.reference}&orderId=${order.id}`;
            resolve();
          },
        };

        // Add mobile money details for MPESA and Airtel
        if ((stepData.payment.method === 'mpesa' || stepData.payment.method === 'airtel') && stepData.payment.phoneNumber) {
          config.mobile_money = {
            phone: stepData.payment.phoneNumber,
            provider: stepData.payment.method === 'mpesa' ? 'mpesa' : 'airtel',
          };
        }

        const handler = paystack.setup(config);
        handler.openIframe();
      };
      script.onerror = () => reject(new Error("Failed to load Paystack script"));
      document.body.appendChild(script);
    });
  };



  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      if (!validateRequiredBillingFields(stepData.billing)) {
        alert('Please complete all required billing information');
        setActiveStep(1);
        return;
      }

      const order = await createOrder();

      // All payment methods use Paystack
      await processPaystackPayment(order);
    } catch (err: unknown) {
      console.error("Error placing order:", err);
      alert(err instanceof Error ? err.message : "Something went wrong during checkout");
    } finally {
      setLoading(false);
    }
  };

  return {
    stepData,
    activeStep,
    loading,
    setActiveStep,
    handleBillingSubmit,
    handleShippingSubmit,
    handlePaymentSubmit,
    handlePlaceOrder,
    billing,
    shipping,
    coupon,
  };
};
