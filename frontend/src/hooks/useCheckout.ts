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
    paymentData,
    coupon,
    activeStep,
    setBilling,
    setShipping,
    setPaymentMethod,
    setPaymentData,
    setActiveStep,
  } = useCheckoutStore();

  const { items, clearCart } = useCartStore();

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
    payment: { method: 'card' },
    items: items, // use items from useCartStore directly
    totals: {
      subtotal: 0,
      shipping: 0,
      vat: 0,
      discount: 0,
      total: 0
    },
    customer: user,
  });

  // Fetch customer data on mount if user is logged in
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch('/api/customer');
        const data = await response.json();

        if (data.success && data.billing) {
          // Only update if store is empty to avoid overwriting newer local changes
          if (!billing) {
            const address = mapToAddress(data.billing);
            setBilling(address as any);
            if (sameAsBilling) {
              setShipping(address as any);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
      }
    };

    if (user.id) {
      fetchCustomerData();
    }
  }, [user.id, setBilling, setShipping, sameAsBilling, billing]);

  // Fetch shipping zones
  useEffect(() => {
    const fetchShippingZones = async () => {
      try {
        const response = await fetch('/api/shipping-zones');
        const result = await response.json();

        if (result.success) {
          // Extract all zones from different possible response structures
          const allZones: any[] = [];
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
        }
      } catch (error) {
        console.error('Failed to fetch shipping zones:', error);
      }
    };

    fetchShippingZones();
  }, []);

  // Update totals & step data when dependencies change
  useEffect(() => {
    const payment: PaymentData = {
      method: paymentData?.method || paymentMethod || 'card',
      phoneNumber: paymentData?.phoneNumber || '',
    };

    setStepData(prev => {
      const shippingCost = prev.totals.shipping || 0;
      const totals = calculateTotals(items, shippingCost, coupon);

      return {
        ...prev,
        billing: billing ? {
          first_name: billing.fullName?.split(' ')[0] || '',
          last_name: billing.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email || prev.billing.email || '',
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
  }, [billing, shipping, paymentMethod, paymentData, items, coupon, user]);

  const handleBillingSubmit = async (formData: BillingFormData) => {
    const billingData = transformBillingData(formData, user.email);
    const address = mapToAddress(billingData);

    setBilling(address as any);
    // Since the option to have a different shipping address is removed, 
    // we default shipping to be the same as billing.
    setShipping(address as any);

    // Save to backend only if "Save details for future orders" is checked
    if (user.id && formData.saveDetails) {
      try {
        await fetch('/api/customer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billing: billingData }),
        });
      } catch (error) {
        console.error('Failed to save billing to backend:', error);
      }
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
    setActiveStep(4);
  };

  const createOrder = async (): Promise<{ id: string; total: string }> => {
    // Map addresses to backend format
    const shippingAddress = {
      fullName: `${stepData.shipping.first_name} ${stepData.shipping.last_name}`,
      streetLine1: stepData.shipping.address_1,
      streetLine2: stepData.shipping.address_2 || "",
      city: stepData.shipping.city,
      province: stepData.shipping.county,
      postalCode: stepData.shipping.postcode,
      phoneNumber: stepData.shipping.phone,
      country: stepData.shipping.country
    };

    const billingAddress = {
      fullName: `${stepData.billing.first_name} ${stepData.billing.last_name}`,
      streetLine1: stepData.billing.address_1,
      streetLine2: "", // Billing in store doesn't have address_2
      city: stepData.billing.city,
      province: stepData.billing.county,
      postalCode: stepData.billing.postcode,
      phoneNumber: stepData.billing.phone,
      country: stepData.billing.country
    };

    // Get session ID from cart store
    const sessionId = useCartStore.getState().sessionId;

    const orderRes = await fetch("/api/checkout/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "x-guest-id": sessionId } : {})
      },
      body: JSON.stringify({
        shippingAddress,
        billingAddress,
        shippingMethodId: "standard" // TODO: Get from store
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(orderData.message || "Order creation failed");
    }

    return { id: orderData.orderId, total: String(orderData.total) };
  };

  const processPaystackPayment = async (order: { id: string; total: string }) => {
    // Backend returns total in cents already, so no need to multiply by 100
    // Paystack expects amount in kobo (for NGN) or cents (for KES)
    const amount = formatPaystackAmount(parseFloat(order.total));

    const configResponse = await fetch('/api/store/config');
    const config = await configResponse.json();

    if (!config.paystackPublicKey) {
      throw new Error('Paystack is not configured. Please contact support.');
    }

    if (!config.paystackEnabled) {
      throw new Error('Paystack payments are currently disabled. Please contact support.');
    }

    return new Promise<void>((resolve, reject) => {
      if ((window as any).PaystackPop) {
        initializePaystack();
      } else {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = initializePaystack;
        script.onerror = () => reject(new Error("Failed to load Paystack script"));
        document.body.appendChild(script);
      }

      function initializePaystack() {
        const paystack = (window as any).PaystackPop;
        if (!paystack) {
          reject(new Error("Paystack script failed to load"));
          return;
        }

        const paystackConfig: any = {
          key: config.paystackPublicKey,
          email: stepData.billing.email || user.email,
          amount,
          currency: config.currency || "KES",
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

        // Set payment channels based on selected payment method
        if (stepData.payment.method === 'card') {
          paystackConfig.channels = ['card'];
        } else if (stepData.payment.method === 'mpesa') {
          paystackConfig.channels = ['mobile_money'];
          if (stepData.payment.phoneNumber) {
            paystackConfig.mobile_money = {
              phone: stepData.payment.phoneNumber,
              provider: 'mpesa',
            };
          }
        } else if (stepData.payment.method === 'airtel') {
          paystackConfig.channels = ['mobile_money'];
          if (stepData.payment.phoneNumber) {
            paystackConfig.mobile_money = {
              phone: stepData.payment.phoneNumber,
              provider: 'airtel',
            };
          }
        }

        const handler = paystack.setup(paystackConfig);
        handler.openIframe();
      }
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
