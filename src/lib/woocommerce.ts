import axios from "axios";

const woo = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3`,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY!,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET!,
  },
});

// Add response interceptor for better error logging
woo.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('WooCommerce API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        headers: error.response.headers,
      });

      if (error.response.status === 401) {
        console.error('Authentication failed. Check WooCommerce consumer key and secret.');
        console.error('Environment variables:', {
          WOOCOMMERCE_CONSUMER_KEY: process.env.WOOCOMMERCE_CONSUMER_KEY ? 'Set' : 'Not set',
          WOOCOMMERCE_CONSUMER_SECRET: process.env.WOOCOMMERCE_CONSUMER_SECRET ? 'Set' : 'Not set',
          NEXT_PUBLIC_WORDPRESS_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL,
        });
      }
    } else if (error.request) {
      // Network error
      console.error('WooCommerce API Network Error:', error.request);
    } else {
      // Other error
      console.error('WooCommerce API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default woo;

// Customer sync functions
export interface WooCommerceCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

export async function getOrCreateWooCommerceCustomer(userId: string, userData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<WooCommerceCustomer> {
  try {
    // First, try to find existing customer by email
    const searchResponse = await woo.get('/customers', {
      params: { email: userData.email }
    });

    if (searchResponse.data && searchResponse.data.length > 0) {
      return searchResponse.data[0];
    }

    // If no customer found, create new one
    const customerData = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.email, // Use email as username
      billing: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
      },
      shipping: {
        first_name: userData.firstName,
        last_name: userData.lastName,
      },
      meta_data: [
        {
          key: '_clerk_user_id',
          value: userId,
        },
      ],
    };

    const createResponse = await woo.post('/customers', customerData);
    return createResponse.data;
  } catch (error) {
    console.error('Error syncing WooCommerce customer:', error);
    throw error;
  }
}

export async function getWooCommerceCustomerByEmail(email: string): Promise<WooCommerceCustomer | null> {
  try {
    const response = await woo.get('/customers', {
      params: { email }
    });

    if (response.data && response.data.length > 0) {
      return response.data[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching WooCommerce customer:', error);
    return null;
  }
}

export async function getWooCommerceOrdersByCustomer(customerId: number) {
  try {
    const response = await woo.get('/orders', {
      params: { customer: customerId, per_page: 50 }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching WooCommerce orders:', error);
    return [];
  }
}

export async function updateWooCommerceCustomerBilling(customerId: number, billingData: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}) {
  try {
    const response = await woo.put(`/customers/${customerId}`, {
      billing: billingData
    });

    return response.data;
  } catch (error) {
    console.error('Error updating WooCommerce customer billing:', error);
    throw error;
  }
}
