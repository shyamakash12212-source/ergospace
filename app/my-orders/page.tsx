"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type Order = {
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  orderDate: string;
  backendOrderId?: string;
  trackingToken?: string;
  status?: string;
  createdAt?: string;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      let history: Order[] = [];

      try {
        const savedOrders = localStorage.getItem("ergospace-orders");

        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) history = parsed;
        }

        // Include latest order if it is not already in history
        const latestOrder = localStorage.getItem("ergospace-last-order");

        if (latestOrder) {
          const parsedOrder: Order = JSON.parse(latestOrder);

          const exists = history.some(
            (order) => order.orderDate === parsedOrder.orderDate
          );

          if (!exists) {
            history = [parsedOrder, ...history];
          }
        }
      } catch (error) {
        console.error("Unable to load saved orders:", error);
      }

      setOrders(history);

      // Fetch current status for guest orders from the backend
      const updatedOrders = await Promise.all(
        history.map(async (order) => {
          if (!order.backendOrderId || !order.trackingToken) {
            return order;
          }

          try {
            const response = await fetch(
              `https://ergospace-backend.onrender.com/api/orders/${order.backendOrderId}/status`,
              {
                headers: {
                  "X-Order-Tracking-Token": order.trackingToken,
                },
              }
            );

            if (!response.ok) return order;

            const data = await response.json();

            return {
              ...order,
              status: data.status,
              createdAt: data.createdAt,
            };
          } catch (error) {
            console.error("Unable to refresh order status:", error);
            return order;
          }
        })
      );

      setOrders(updatedOrders);
      localStorage.setItem("ergospace-orders", JSON.stringify(updatedOrders));
    };

    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f7f6]">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#174c49]">
            ErgoSpace
          </Link>

          <Link
            href="/products"
            className="text-[#174c49] font-medium hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-5 py-12">

        <div className="mb-10">
          <p className="text-[#648581] font-medium mb-2">
            Your Account
          </p>

          <h1 className="text-4xl font-bold text-[#174c49]">
            My Orders
          </h1>

          <p className="text-gray-500 mt-3">
            Track and view your ErgoSpace purchases.
          </p>
        </div>

        {orders.length === 0 ? (
          /* Empty Orders */
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="text-6xl mb-5">📦</div>

            <h2 className="text-2xl font-bold text-[#174c49] mb-3">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mb-7">
              Your orders will appear here once you make a purchase.
            </p>

            <Link
              href="/products"
              className="inline-block bg-[#174c49] text-white px-7 py-3 rounded-xl font-semibold hover:bg-[#103b39]"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">

            {orders.map((order, index) => {
              const orderId = `ES-${new Date(order.orderDate)
                .getTime()
                .toString()
                .slice(-8)}`;

              return (
                <div
                  key={`${order.orderDate}-${index}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >

                  {/* Order Header */}
                  <div className="bg-[#f0f7f5] px-6 py-5 flex flex-wrap justify-between gap-4">

                    <div>
                      <p className="text-sm text-gray-500">
                        Order Reference
                      </p>

                      <p className="font-bold text-[#174c49] mt-1">
                        {orderId}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Order Date
                      </p>

                      <p className="font-medium text-gray-800 mt-1">
                        {new Date(order.orderDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Order Status
                      </p>

                      <span className="inline-block mt-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {order.status || "Order Placed"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Amount
                      </p>

                      <p className="text-lg font-bold text-[#174c49] mt-1">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </div>

                  </div>

                  {/* Ordered Products */}
                  <div className="p-6">

                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                      Ordered Products
                    </h2>

                    <div className="space-y-5">

                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 border-b border-gray-100 pb-5"
                        >

                          {/* Product Image */}
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                              🪑
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {item.name}
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                              Quantity: {item.quantity}
                            </p>

                            <p className="text-[#174c49] font-medium mt-2">
                              ₹{item.price.toLocaleString("en-IN")} each
                            </p>
                          </div>

                          {/* Item Total */}
                          <div className="font-bold text-gray-800">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </div>

                        </div>
                      ))}

                    </div>

                    {/* Delivery Address */}
                    <div className="mt-6 bg-gray-50 rounded-xl p-5">

                      <h3 className="font-semibold text-[#174c49] mb-2">
                        Delivery Address
                      </h3>

                      <p className="text-gray-600 text-sm">
                        {order.customer.name}
                      </p>

                      <p className="text-gray-600 text-sm">
                        {order.customer.address}, {order.customer.city},
                        {" "}{order.customer.state} - {order.customer.pincode}
                      </p>

                    </div>

                    {/* Price Summary */}
                    <div className="mt-6 max-w-sm ml-auto space-y-3">

                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>
                          ₹{order.subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>
                          {order.shipping === 0
                            ? "FREE"
                            : `₹${order.shipping.toLocaleString("en-IN")}`}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-4 text-lg font-bold text-[#174c49]">
                        <span>Total</span>
                        <span>
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        ErgoSpace — Work Better. Feel Better.
      </footer>

    </main>
  );
}