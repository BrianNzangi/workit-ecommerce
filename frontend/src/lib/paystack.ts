export async function initializePaystackPayment(email: string, amount: number, orderId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/paystack/v1/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount, order_id: orderId }),
  });

  const data = await res.json();

  if (!res.ok || !data?.data?.authorization_url) {
    throw new Error(data.message || "Failed to initialize Paystack payment");
  }

  return data.data; // contains authorization_url and reference
}