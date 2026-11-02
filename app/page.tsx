"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  features?: string[];
};

const API_URL = "http://localhost:5001";

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword)
    );
  });

  const getIcon = (category: string) => {
    const value = category.toLowerCase();

    if (value.includes("laptop")) return "💻";
    if (value.includes("mouse") || value.includes("desk")) return "🖱️";
    if (value.includes("furniture") || value.includes("chair")) return "🪑";

    return "🖥️";
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-teal-700">
            ErgoSpace
          </h1>

          <nav className="flex gap-6 text-sm font-medium">
            <a href="#home" className="hover:text-teal-700">Home</a>
            <a href="#products" className="hover:text-teal-700">Products</a>
            <a href="#compare" className="hover:text-teal-700">Compare</a>
            <a href="#about" className="hover:text-teal-700">About</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="bg-teal-800 px-6 py-24 text-center text-white"
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Work Better. Feel Better.
        </p>

        <h2 className="mx-auto max-w-3xl text-4xl font-bold md:text-5xl">
          Create Your Perfect Ergonomic Workspace
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-teal-100">
          Discover ergonomic desk accessories designed to improve
          comfort, productivity and your everyday workspace.
        </p>

        <a
          href="#products"
          className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-teal-800 hover:bg-gray-100"
        >
          Explore Products
        </a>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">

          <h2 className="text-center text-3xl font-bold">
            Explore Our Products
          </h2>

          <p className="mt-3 text-center text-gray-500">
            Find the right accessories for your workspace.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-8 max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 outline-none focus:border-teal-600"
            />
          </div>

          {/* PRODUCT CARDS */}
          {loading ? (
            <p className="mt-12 text-center text-gray-500">
              Loading products...
            </p>
          ) : error ? (
            <p className="mt-12 text-center text-red-600">
              {error}
            </p>
          ) : (
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-teal-50 text-5xl">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      getIcon(product.category)
                    )}
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase text-teal-700">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    {product.name}
                  </h3>

                  <p className="mt-3 text-sm text-gray-600">
                    {product.description}
                  </p>

                  <p className="mt-4 font-semibold text-teal-800">
                    {typeof product.price === "number"
                      ? `₹${product.price.toLocaleString("en-IN")}`
                      : "Price to be verified"}
                  </p>

                  <div className="mt-4">
                    <p className="text-sm font-semibold">Key Features</p>

                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {(product.features ?? []).length > 0 ? (
                        product.features!.map((feature, index) => (
                          <li key={index}>✓ {feature}</li>
                        ))
                      ) : (
                        <li>Features to be updated</li>
                      )}
                    </ul>
                  </div>
                </article>
              ))}

            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="mt-10 text-center text-gray-500">
              No products found. Try another search.
            </p>
          )}

        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section id="compare" className="bg-teal-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">

          <h2 className="text-center text-3xl font-bold">
            Product Comparison
          </h2>

          <p className="mt-3 text-center text-gray-600">
            Compare key features before choosing your product.
          </p>

          <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[650px] border-collapse text-left">

              <thead className="bg-teal-800 text-white">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Main Feature</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-4 font-semibold">
                      {product.name}
                    </td>

                    <td className="p-4">
                      {product.features?.[0] || "Not specified"}
                    </td>

                    <td className="p-4">
                      {product.category}
                    </td>

                    <td className="p-4">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-bold">
            About ErgoSpace
          </h2>

          <p className="mt-5 leading-7 text-gray-600">
            ErgoSpace is an ergonomic desk accessories platform.
            Our goal is to help users explore, understand and compare
            workspace products so they can make informed choices.
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 px-6 py-8 text-center text-white">
        <h2 className="text-xl font-bold">ErgoSpace</h2>

        <p className="mt-2 text-sm text-gray-400">
          Build a comfortable workspace. Improve your productivity.
        </p>

        <p className="mt-4 text-xs text-gray-500">
          ©️ 2026 ErgoSpace. All rights reserved.
        </p>
      </footer>

    </main>
  );
}