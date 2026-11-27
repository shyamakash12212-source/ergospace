"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  features?: string[];
};

function ProductDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    fetch("https://ergospace-backend.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : data.products || [];
        const foundProduct = products.find(
          (item: Product) => item._id === id
        );
        setProduct(foundProduct || null);
      })
      .catch((error) => console.error("Product fetch error:", error))
      .finally(() => setLoading(false));
  }, [id]);


  const addToCart = () => {
    if (!product) return;

    const savedCart = localStorage.getItem("ergospace-cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];

    const existingItem = cart.find(
      (item: { _id: string }) => item._id === product._id
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item: { _id: string; quantity: number }) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    localStorage.setItem("ergospace-cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setCartMessage("Product added to cart successfully!");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f9f7]">
        <p className="text-[#174c49] text-lg">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9f7] text-[#173b3a]">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <Link
          href="/products"
          className="mt-5 bg-[#174c49] text-white px-6 py-3 rounded-lg"
        >
          Back to Products
        </Link>
      </main>
    );
  }

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

      <section className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/products"
          className="inline-block mb-8 text-[#174c49] hover:text-orange-500"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-[#edf4f1] rounded-3xl min-h-[420px] flex items-center justify-center p-8">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[400px] object-contain"
              />
            ) : (
              <span className="text-9xl">🪑</span>
            )}
          </div>

          <div className="py-4">
            <p className="text-orange-500 uppercase tracking-widest font-semibold text-sm">
              {product.category}
            </p>

            <h1 className="text-4xl font-bold mt-4">{product.name}</h1>

            <p className="text-2xl font-bold text-[#174c49] mt-6">
              ₹{product.price}
            </p>

            <div className="w-16 h-1 bg-orange-400 rounded-full my-6" />

            <h2 className="text-xl font-semibold">Product Description</h2>
            <p className="text-gray-600 leading-7 mt-3">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold">Key Features</h2>
                <ul className="mt-4 space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex gap-3 text-gray-600">
                      <span className="text-[#174c49] font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cartMessage && (
              <p className="mt-4 text-center text-green-700 font-medium">
                {cartMessage}
              </p>
            )}

            <button
              onClick={addToCart}
              className="mt-8 w-full bg-[#174c49] hover:bg-[#103b39] text-white py-4 rounded-xl font-semibold"
            >
              🛒 Add to Cart
            </button>

            <Link
              href="/products"
              className="block text-center mt-4 border border-[#174c49] text-[#174c49] py-4 rounded-xl hover:bg-[#edf4f1]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#173b3a] text-white text-center py-8">
        <p>© 2026 ErgoSpace. Designed for better workspaces.</p>
      </footer>
    </main>
  );
}


export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#f8f9f7]">
          <p className="text-[#174c49] text-lg">Loading product...</p>
        </main>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}
