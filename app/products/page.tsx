"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  features?: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ergospace-backend.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
      })
      .catch((err) => console.error("Products fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#173b3a]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#174c49]">
            ErgoSpace
          </Link>

          <nav className="flex gap-5 text-sm font-medium">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <Link href="/products" className="text-orange-500">Products</Link>
            <Link href="/compare" className="hover:text-orange-500">Compare</Link>
            <Link href="/about" className="hover:text-orange-500">About</Link>
          </nav>

          <Link
            href="/cart"
            className="rounded-full bg-[#174c49] text-white px-5 py-2 text-sm"
          >
            Cart
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-orange-500 font-semibold tracking-widest text-sm">
            ERGONOMIC COLLECTION
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Explore Our Products
          </h1>
          <p className="text-gray-600 mt-4">
            Find the right essentials for your comfortable workspace.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-[#174c49]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-5 py-2 rounded-full border text-sm ${
                category === item
                  ? "bg-[#174c49] text-white border-[#174c49]"
                  : "bg-white border-gray-200 hover:border-[#174c49]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-16">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="text-gray-500 mt-3">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition"
              >
                <div className="h-64 bg-[#edf4f1] flex items-center justify-center p-6">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-7xl">🪑</span>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h2 className="text-xl font-bold mt-2">{product.name}</h2>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  {product.features && (
                    <ul className="mt-3 text-sm text-gray-600 space-y-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <li key={index}>✓ {feature}</li>
                      ))}
                    </ul>
                  )}

                  <p className="text-lg font-bold text-[#174c49] mt-4">
                    ₹{product.price}
                  </p>

                  <Link
                    href={`/products/${product._id}`}
                    className="block text-center mt-4 bg-[#174c49] text-white py-3 rounded-lg hover:bg-[#103b39]"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="bg-[#173b3a] text-white text-center py-8">
        <p>© 2026 ErgoSpace. Designed for better workspaces.</p>
      </footer>
    </main>
  );
}
