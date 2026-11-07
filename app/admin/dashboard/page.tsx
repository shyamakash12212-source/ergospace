"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("https://ergospace-backend.onrender.com/api/products")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load products");
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ErgoSpace Admin
          </h1>
          <p className="text-gray-600">Product Management Dashboard</p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-5 py-2 text-white"
        >
          Logout
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-3xl font-bold text-gray-900">
            {products.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Admin Status</p>
          <h2 className="text-xl font-bold text-green-600">Logged In</h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Platform</p>
          <h2 className="text-xl font-bold text-gray-900">ErgoSpace</h2>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Product List
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-700">
                      {product.category}
                    </td>
                    <td className="p-3 text-gray-700">
                      ₹{product.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}