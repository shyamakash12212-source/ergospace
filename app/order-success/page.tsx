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

type Order = {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  orderDate: string;
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("ergospace-last-order");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f5f7f6] flex items-center justify-center px-6">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#174c49] mb-3">
            No Order Found
          </h1>

          <p className="text-gray-600 mb-6">
            Please place an order first to view your confirmation.
          </p>

          <Link
            href="/products"
            className="inline-block bg-[#174c49] text-white px-6 py-3 rounded-lg"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const orderId = `ES-${new Date(order.orderDate)
    .getTime()
    .toString()
    .slice(-8)}`;

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Success Message */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 text-center">

          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-green-600">✓</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#174c49] mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 text-lg mb-3">
            Thank you for shopping with ErgoSpace.
          </p>

          <p className="text-gray-500 mb-8">
            Your order has been placed successfully.
          </p>

          <div className="bg-[#f0f7f5] rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order Reference</p>

            <p className="text-xl font-bold text-[#174c49]">
              {orderId}
            </p>
          </div>

          {/* Order Summary */}
          <div className="text-left border-t border-gray-200 pt-6">

            <h2 className="text-xl font-bold text-[#174c49] mb-5">
              Order Summary
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Details */}
            <div className="mt-6 space-y-3 text-gray-600">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shipping === 0
                    ? "FREE"
                    : `₹${order.shipping.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-bold text-[#174c49]">
                <span>Total Amount</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>

            </div>
          </div>

          {/* Delivery Details */}
          <div className="mt-8 text-left bg-gray-50 rounded-2xl p-6">

            <h2 className="text-xl font-bold text-[#174c49] mb-4">
              Delivery Details
            </h2>

            <p className="font-semibold text-gray-800">
              {order.customer.name}
            </p>

            <p className="text-gray-600 mt-1">
              {order.customer.address}
            </p>

            <p className="text-gray-600">
              {order.customer.city}, {order.customer.state}
            </p>

            <p className="text-gray-600">
              PIN: {order.customer.pincode}
            </p>

            <p className="text-gray-600 mt-3">
              Phone: {order.customer.phone}
            </p>

            <p className="text-gray-600">
              Email: {order.customer.email}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">

            <Link
              href="/products"
              className="flex-1 bg-[#174c49] text-white py-4 rounded-xl font-semibold text-center hover:bg-[#103b39] transition"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="flex-1 border border-[#174c49] text-[#174c49] py-4 rounded-xl font-semibold text-center hover:bg-[#f0f7f5] transition"
            >
              Back to Home
            </Link>

          </div>

        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          ErgoSpace — Work Better. Feel Better.
        </p>

      </div>
    </main>
  );
}