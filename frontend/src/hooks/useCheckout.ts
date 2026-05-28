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
} from '@/lib/checkout/checkout-utils';
import { CSRF_HEADER_NAME, ensureCsrfToken } from '@/lib/security/csrf';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomer';
import { useShippingZones } from '@/hooks/useShippingZones';
import { useStoreConfig } from '@/hooks/useStoreConfig';

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

  const { items } = useCartStore();

  const [loading, setLoading] = useState(false);

  const { data: customerData } = useCustomer();
  const { data: shippingZones } = useShippingZones();
  const { data: storeConfig } = useStoreConfig();

  // Sync customer data into checkout store
  useEffect(() => {
    if (customerData?.billing && !billing) {
      const address = mapToAddress(customerData.billing);
      setBilling(address as any);
      if (sameAsBilling) {
        setShipping(address as any);
      }
    }
  }, [customerData, setBilling, setShipping, sameAsBilling, billing]);

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
    items: items,
    totals: {
      subtotal: 0,
      shipping: 0,
      vat: 0,
      discount: 0,
      total: 0
    },
    customer: user,
  });

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

  const updateCustomerMutation = useUpdateCustomer();

  const handleBillingSubmit = async (formData: BillingFormData) => {
    const billingData = transformBillingData(formData, user.email);
    const address = mapToAddress(billingData);

    setBilling(address as any);
    setShipping(address as any);

    if (user.id && formData.saveDetails) {
      try {
        await updateCustomerMutation.mutateAsync({ billing: billingData } as Record<string, unknown>);
      } catch (error) {
        console.error('Failed to save billing to backend:', error);
      }
    }

    setStepData((prev) => ({ ...prev, billing: billingData }));
    setActiveStep(2);
  };

  const handleShippingSubmit = (data: any) => {
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
      streetLine2: "",
      city: stepData.billing.city,
      province: stepData.billing.county,
      postalCode: stepData.billing.postcode,
      phoneNumber: stepData.billing.phone,
      country: stepData.billing.country
    };

    const sessionId = useCartStore.getState().sessionId;

    const csrfPromise = ensureCsrfToken().catch(() => null);
    const csrfTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const csrfToken = await Promise.race([csrfPromise, csrfTimeout]);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(sessionId ? { "x-guest-id": sessionId } : {}),
    };
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }

    const controller = new AbortController();
    const timeoutMs = 75000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let orderRes: Response;
    try {
      orderRes = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          shippingAddress,
          billingAddress,
          shippingMethodId: "standard",
          ...(coupon?.code ? { couponCode: coupon.code } : {})
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(orderData.message || "Order creation failed");
    }

    return { id: orderData.orderId, total: String(orderData.total) };
  };

  const processPaystackPayment = async (order: { id: string; total: string }) => {
    const config = storeConfig;
    if (!config) {
      throw new Error('Store configuration not loaded. Please try again.');
    }
    if (!config) {
      throw new Error('Store configuration not loaded. Please try again.');
    }

    if (!config.paystackPublicKey) {
      throw new Error('Paystack is not configured. Please contact support.');
    }

    if (!config.paystackEnabled) {
      throw new Error('Paystack payments are currently disabled. Please contact support.');
    }

    const amount = formatPaystackAmount(parseFloat(order.total));

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid payment amount. Please contact support.');
    }

    const payerEmail = stepData.billing.email || user.email;
    if (!payerEmail) {
      throw new Error('Email is required to process payment.');
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
          key: config!.paystackPublicKey,
          email: payerEmail,
          amount,
          currency: config!.currency || "KES",
          ref: `order-${order.id}-${Date.now()}`,
          metadata: {
            orderId: order.id,
            customerId: user.id || null,
            email: payerEmail,
          },
          onClose: () => {
            setLoading(false);
            reject(new Error("Payment popup closed"));
          },
          callback: (response: PaystackResponse) => {
            window.location.href = `/checkout/success?trxref=${response.trxref}&reference=${response.reference}&orderId=${order.id}`;
            resolve();
          },
        };

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
