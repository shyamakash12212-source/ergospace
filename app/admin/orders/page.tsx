"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5001";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login?next=/admin/orders";
      return;
    }

    fetchOrders();
  }, []);

  async function fetchOrders() {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login?next=/admin/orders";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "/admin/login?next=/admin/orders";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login?next=/admin/orders";
      return;
    }

    setUpdatingId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "/admin/login?next=/admin/orders";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? { ...order, status: data.order.status }
            : order
        )
      );

      setMessage("Order status updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function logout() {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login?next=/admin/orders";
  }

  const totalRevenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + order.totalAmount, 0);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ErgoSpace Admin
          </h1>
          <p className="text-gray-600">Orders Management</p>
        </div>

        <div className="flex gap-3">
          <a
            href="/admin/dashboard"
            className="rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
          >
            Products
          </a>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-3xl font-bold text-gray-900">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Pending Orders</p>
          <h2 className="text-3xl font-bold text-orange-600">
            {orders.filter((order) => order.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Order Value (excluding cancelled)</p>
          <h2 className="text-3xl font-bold text-green-600">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>
      </section>

      {message && (
        <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-xl bg-white p-5 shadow md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Customer Orders
          </h2>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-lg bg-gray-800 px-5 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-gray-600">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-gray-600">
            No orders found.
          </p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="mb-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {order.status}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Customer
                    </p>
                    <p className="text-gray-600">{order.customer.name}</p>
                    <p className="text-gray-600">{order.customer.phone}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      Delivery Address
                    </p>
                    <p className="text-gray-600">
                      {order.customer.address}
                    </p>
                  </div>
                </div>

                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="p-2">Product</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Quantity</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={`${order._id}-${index}`} className="border-b">
                          <td className="p-2 text-gray-800">{item.name}</td>
                          <td className="p-2 text-gray-700">
                            ₹{item.price.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 text-gray-700">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                      disabled={updatingId === order._id}
                      className="rounded-lg border border-gray-300 p-2 text-gray-800 disabled:opacity-50"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updatingId === order._id && (
                      <span className="text-sm text-gray-500">
                        Updating...
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}