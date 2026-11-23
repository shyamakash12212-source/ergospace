
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://ergospace-backend.onrender.com/api';

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  features?: string[];
}

export interface OrderRequest {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrderResponse {
  message: string;
  order: {
    _id: string;
    totalAmount: number;
    status: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface CustomerAuthResponse {
  message: string;
  token: string;
  customer: Customer;
}

const TOKEN_KEY = 'ergospace_customer_token';
const CUSTOMER_KEY = 'ergospace_customer_profile';

export async function saveCustomerProfile(customer: Customer): Promise<void> {
  await SecureStore.setItemAsync(
    CUSTOMER_KEY,
    JSON.stringify(customer)
  );
}

export async function getCustomerProfile(): Promise<Customer | null> {
  const profile = await SecureStore.getItemAsync(CUSTOMER_KEY);
  return profile ? JSON.parse(profile) as Customer : null;
}

export async function getCustomerToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveCustomerToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeCustomerToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(CUSTOMER_KEY);
}

export async function customerSignup(
  name: string,
  phone: string,
  password: string
): Promise<CustomerAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/customer/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  await saveCustomerToken(data.token);
  await saveCustomerProfile(data.customer);
  return data;
}

export async function customerLogin(
  phone: string,
  password: string
): Promise<CustomerAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  await saveCustomerToken(data.token);
  await saveCustomerProfile(data.customer);
  return data;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.products ?? [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

// Existing guest checkout — preserved
export async function createOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Order API error: ${response.status}`);
  }

  return data;
}

export async function createCustomerOrder(orderData: {
  address: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}): Promise<OrderResponse> {
  const token = await getCustomerToken();

  if (!token) {
    throw new Error('Please login to place this order');
  }

  const response = await fetch(`${API_BASE_URL}/customer/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Order API error: ${response.status}`);
  }

  return data;
}

export async function getCustomerOrders() {
  const token = await getCustomerToken();

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await fetch(`${API_BASE_URL}/customer/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not fetch order history');
  }

  return data;
}
