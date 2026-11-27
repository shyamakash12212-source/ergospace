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

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
const [paymentMethod, setPaymentMethod] = useState("UPI");
const [upiId, setUpiId] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("ergospace-cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  setLoading(true);

 const order = {
  customer,
  items: cart,
  subtotal,
  shipping,
  total,
  paymentMethod,
  orderDate: new Date().toISOString(),
};

  // Save latest order
  localStorage.setItem(
    "ergospace-last-order",
    JSON.stringify(order)
  );

  // Save order history
  const savedOrders = localStorage.getItem("ergospace-orders");
  const previousOrders = savedOrders ? JSON.parse(savedOrders) : [];

  const updatedOrders = [order, ...previousOrders];

  localStorage.setItem(
    "ergospace-orders",
    JSON.stringify(updatedOrders)
  );

  // Clear cart from localStorage
  localStorage.removeItem("ergospace-cart");

  // Clear cart state
  setCart([]);

  // Update cart badge
  window.dispatchEvent(new Event("cartUpdated"));

  // Redirect to success page
  window.location.href = "/order-success";
};

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#26332d]">
      <header className="border-b bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#234b3c]">
            ErgoSpace
          </Link>

          <div className="text-sm text-gray-500">
            Cart → <span className="font-semibold text-[#234b3c]">Checkout</span> → Confirmation
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
        <p className="mb-8 text-gray-500">
          Complete your details to place your order.
        </p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Customer Details */}
          <section className="lg:col-span-2">
            <form
              onSubmit={handlePlaceOrder}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h2 className="mb-6 text-xl font-semibold">
                Delivery Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={customer.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit phone number"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    value={customer.pincode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="6-digit pincode"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="House number, street, landmark..."
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>
                  <input
                    name="city"
                    value={customer.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    State
                  </label>
                  <input
                    name="state"
                    value={customer.state}
                    onChange={handleChange}
                    required
                    placeholder="State"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                  />
                </div>
              </div>
              {/* Payment Section */}
              <div className="mt-8 border-t pt-6">
                <h2 className="mb-4 text-xl font-semibold">
                  Delivery & Payment
                </h2>

                <div className="mb-5 rounded-xl border p-4">
                  <p className="font-medium">Standard Delivery</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Delivery within 3–5 business days
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#234b3c]">
                    Free delivery
                  </p>
                </div>

                <h3 className="mb-3 font-medium">Choose Payment Method</h3>

                <div className="space-y-3">
                  {/* UPI */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="mt-1 accent-[#234b3c]"
                    />
                    <div className="flex-1">
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-gray-500">
                        Pay using your UPI ID
                      </p>

                      {paymentMethod === "UPI" && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="name@bank"
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#477b62]"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Demo field, not stored. No real payment is processed.
                          </p>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Card */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={() => setPaymentMethod("Card")}
                      className="mt-1 accent-[#234b3c]"
                    />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Card payments would be securely handled by a payment
                        provider. Not connected in this concept.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 accent-[#234b3c]"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Pay in cash when your order arrives.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full rounded-xl bg-[#234b3c] px-6 py-4 font-semibold text-white transition hover:bg-[#315f4d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : `Place Order • ₹${total.toLocaleString("en-IN")}`}
                </button>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Please review your delivery details before placing your order.
                </p>
              </div>
            </form>
          </section>

          {/* Order Summary */}
          <section>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>

              {cart.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-gray-500">Your cart is empty.</p>
                  <Link
                    href="/products"
                    className="mt-4 inline-block font-medium text-[#477b62]"
                  >
                    Browse Products →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                            📦
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="mt-1 font-semibold">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 border-t pt-5">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>

                    {subtotal < 2000 && subtotal > 0 && (
                      <p className="text-xs text-gray-500">
                        Add ₹{(2000 - subtotal).toLocaleString("en-IN")} more for free shipping.
                      </p>
                    )}

                    <div className="flex justify-between border-t pt-4 text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/cart"
              className="mt-5 block text-center text-sm font-medium text-[#477b62] hover:underline"
            >
              ← Back to Cart
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}