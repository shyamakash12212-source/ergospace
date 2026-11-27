"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("ergospace-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("ergospace-cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (id: string) => {
    saveCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    saveCart(
      cart
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    saveCart(cart.filter((item) => item._id !== id));
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#173b3a]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#174c49]">
            ErgoSpace
          </Link>
          <nav className="flex gap-5 text-sm font-medium">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <Link href="/products" className="hover:text-orange-500">Products</Link>
            <Link href="/compare" className="hover:text-orange-500">Compare</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Your Shopping Cart</h1>
        <p className="text-gray-500 mb-10">
          Review your products before proceeding.
        </p>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-gray-500 mt-3">
              Explore our ergonomic products and find what you need.
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 bg-[#174c49] text-white px-7 py-3 rounded-xl"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              {cart.map((item) => (
                <article
                  key={item._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5"
                >
                  <div className="w-full sm:w-40 h-40 bg-[#edf4f1] rounded-xl flex items-center justify-center p-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">🪑</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-orange-500 text-xs uppercase font-semibold">
                      {item.category}
                    </p>
                    <h2 className="text-xl font-bold mt-2">{item.name}</h2>
                    <p className="text-[#174c49] font-bold mt-2">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>

                    <div className="flex items-center gap-3 mt-5">
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                        className="w-9 h-9 border rounded-lg hover:bg-[#edf4f1]"
                      >
                        −
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item._id)}
                        className="w-9 h-9 border rounded-lg hover:bg-[#edf4f1]"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="ml-auto text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm text-gray-500">Item Total</p>
                    <p className="text-xl font-bold mt-2">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
              <h2 className="text-xl font-bold mb-5">Order Summary</h2>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Items</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>

              <div className="flex justify-between py-5 text-lg font-bold">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

             <Link
  href="/checkout"
  className="block w-full text-center bg-[#174c49] text-white py-4 rounded-xl font-semibold hover:bg-[#103b39]"
>
  Proceed to Checkout
</Link>

              <Link
                href="/products"
                className="block text-center mt-4 text-[#174c49] text-sm hover:text-orange-500"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>

      <footer className="bg-[#173b3a] text-white text-center py-8">
        <p>© 2026 ErgoSpace. Designed for better workspaces.</p>
      </footer>
    </main>
  );
}
