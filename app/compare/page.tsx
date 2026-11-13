"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ergospace-backend.onrender.com";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  features?: string[];
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);

        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const data = await response.json();
        setProducts(data);
      } catch {
        setError("Could not load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleProduct = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        setError("You can compare a maximum of 3 products.");
        return current;
      }

      setError("");
      return [...current, id];
    });
  };

  const comparedProducts = products.filter((product) =>
    selected.includes(product._id)
  );

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12 text-gray-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-teal-800">
            Product Comparison
          </h1>

          <p className="mt-3 text-gray-600">
            Select products and compare their features before making a choice.
          </p>
        </div>

        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : error && products.length === 0 ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const isSelected = selected.includes(product._id);

                return (
                  <div
                    key={product._id}
                    className={`rounded-xl border bg-white p-5 shadow-sm ${
                      isSelected
                        ? "border-teal-600 ring-2 ring-teal-100"
                        : "border-gray-200"
                    }`}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="mb-4 h-44 w-full rounded-lg object-contain"
                      />
                    )}

                    <h2 className="text-xl font-semibold">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {product.category}
                    </p>

                    <p className="mt-3 font-bold text-teal-800">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <button
                      onClick={() => toggleProduct(product._id)}
                      className={`mt-5 w-full rounded-lg px-4 py-3 font-medium text-white ${
                        isSelected
                          ? "bg-gray-600"
                          : "bg-teal-700 hover:bg-teal-800"
                      }`}
                    >
                      {isSelected ? "Remove from Compare" : "Compare Product"}
                    </button>
                  </div>
                );
              })}
            </section>

            {error && (
              <p className="mt-4 text-center text-red-600">{error}</p>
            )}

            {comparedProducts.length > 0 && (
              <section className="mt-14">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-teal-800">
                    Comparison Results
                  </h2>

                  <button
                    onClick={() => setSelected([])}
                    className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow">
                  <table className="w-full min-w-[650px] border-collapse text-left">
                    <thead className="bg-teal-800 text-white">
                      <tr>
                        <th className="p-4">Details</th>

                        {comparedProducts.map((product) => (
                          <th key={product._id} className="p-4">
                            {product.name}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        {
                          label: "Category",
                          value: (p: Product) => p.category,
                        },
                        {
                          label: "Price",
                          value: (p: Product) =>
                            `₹${p.price.toLocaleString("en-IN")}`,
                        },
                        {
                          label: "Description",
                          value: (p: Product) => p.description,
                        },
                        {
                          label: "Key Features",
                          value: (p: Product) =>
                            p.features?.length
                              ? p.features.join(", ")
                              : "Not available",
                        },
                      ].map((row) => (
                        <tr key={row.label} className="border-b">
                          <td className="p-4 font-semibold">{row.label}</td>

                          {comparedProducts.map((product) => (
                            <td key={product._id} className="p-4">
                              {row.value(product)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {comparedProducts.length === 0 && (
              <p className="mt-10 text-center text-gray-500">
                Select at least two products to compare them.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}