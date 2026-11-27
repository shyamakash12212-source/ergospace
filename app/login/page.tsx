"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://ergospace-backend.onrender.com/api/customer/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("ergospace-customer-token", data.token);
      localStorage.setItem(
        "ergospace-customer",
        JSON.stringify(data.customer)
      );

      alert("Login successful!");
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-green-700"
        >
          ← Back to Home
        </a>

        <div className="text-center mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[#183c2b]">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">
            Login to your ErgoSpace account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 10-digit phone number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#245c3b] hover:bg-[#19452c] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-semibold text-green-700 hover:underline"
          >
            Sign Up
          </a>
        </p>

        <div className="text-center mt-4">
          <a
            href="/checkout"
            className="text-sm text-gray-500 hover:text-green-700"
          >
            Continue as Guest
          </a>
        </div>
      </div>
    </main>
  );
}