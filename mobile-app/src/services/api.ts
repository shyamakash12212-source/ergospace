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

export async function getProducts(): Promise<Product[]> {
try {
const response = await fetch("${API_BASE_URL}/products");

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

export async function createOrder(
orderData: OrderRequest
): Promise<OrderResponse> {
const response = await fetch("${API_BASE_URL}/orders", {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(orderData),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Order API error: ${response.status}");
}

return data;
}