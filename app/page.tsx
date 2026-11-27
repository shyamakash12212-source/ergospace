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

const categories = [
  { name: "Laptop Stands", icon: "💻" },
  { name: "Ergonomic Chairs", icon: "🪑" },
  { name: "Desk Accessories", icon: "🖥️" },
  { name: "Mouse & Wrist Support", icon: "🖱️" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);


  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("ergospace-cart");
      const cart = savedCart ? JSON.parse(savedCart) : [];
      const count = cart.reduce(
        (total: number, item: { quantity?: number }) =>
          total + (item.quantity || 0),
        0
      );
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://ergospace-backend.onrender.com/api/products"
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Products error:", error);
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

  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#173b3a]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <a href="/" className="text-2xl font-bold tracking-tight text-[#174c49]">
            ErgoSpace<span className="text-[#e9a15b]">.</span>
          </a>
<nav className="hidden items-center gap-8 text-sm font-medium md:flex">
  <a href="/" className="text-[#174c49]">Home</a>
  <a href="/products" className="hover:text-[#e9a15b]">Products</a>
  <a href="/compare" className="hover:text-[#e9a15b]">Compare</a>
  <a href="/my-orders" className="hover:text-[#e9a15b]">My Orders</a>
  <a href="/about" className="hover:text-[#e9a15b]">About</a>
</nav>

          <div className="flex items-center gap-4">
            <a
              href="/cart"
              className="relative text-sm font-medium hover:text-[#e9a15b]"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#e9a15b] px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href="/login"
              className="hidden rounded-full border border-[#174c49] px-5 py-2 text-sm font-semibold text-[#174c49] hover:bg-[#174c49] hover:text-white sm:inline-block"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="overflow-hidden px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[#edf4f1] px-4 py-2 text-xs font-semibold tracking-wide text-[#174c49]">
              YOUR COMFORT, OUR PRIORITY
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Work Better.
              <br />
              <span className="text-[#e9a15b]">Feel Better.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-600">
              Create a workspace that works for you. Discover thoughtfully
              selected ergonomic accessories for comfort, focus and productivity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/products"
                className="rounded-full bg-[#174c49] px-7 py-3.5 font-semibold text-white hover:bg-[#103b39]"
              >
                Explore Products →
              </a>

              <a
                href="/compare"
                className="rounded-full border border-[#174c49] px-7 py-3.5 font-semibold text-[#174c49] hover:bg-[#edf4f1]"
              >
                Compare Products
              </a>
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] bg-[#edf4f1] p-8 md:min-h-[440px]">
            <div className="text-center">
              <div className="text-8xl md:text-9xl">🪑</div>
              <p className="mt-5 text-sm font-medium tracking-wide text-[#174c49]">
                DESIGN YOUR COMFORTABLE WORKSPACE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-5 py-14 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#e9a15b]">
                Shop by category
              </p>
              <h2 className="mt-2 text-3xl font-bold">Explore Categories</h2>
            </div>

            <a href="/products" className="text-sm font-semibold text-[#174c49]">
              View All Products →
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href="/products"
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-4xl">{category.icon}</div>
                <h3 className="mt-4 font-semibold">{category.name}</h3>
                <p className="mt-2 text-xs text-gray-500">Explore collection →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#e9a15b]">
              Handpicked for you
            </p>
            <h2 className="mt-2 text-3xl font-bold">Featured Products</h2>
            <p className="mt-3 text-gray-500">
              Upgrade your workspace with comfort-focused essentials.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mx-auto mt-8 max-w-xl">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white px-6 py-4 outline-none focus:border-[#174c49]"
            />
          </div>

          {loading ? (
            <p className="mt-12 text-center text-gray-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="mt-12 text-center text-gray-500">
              No products found.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.slice(0, 8).map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-56 items-center justify-center bg-[#edf4f1] p-5">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">🖥️</span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#e9a15b]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-lg font-bold">{product.name}</h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-bold text-[#174c49]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>

                      <a
                        href="/products"
                        className="rounded-full bg-[#174c49] px-4 py-2 text-xs font-semibold text-white hover:bg-[#103b39]"
                      >
                        View Product
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <a
              href="/products"
              className="inline-block rounded-full border border-[#174c49] px-7 py-3 font-semibold text-[#174c49] hover:bg-[#174c49] hover:text-white"
            >
              Explore All Products →
            </a>
          </div>
        </div>
      </section>

      {/* WHY ERGOSPACE */}
      <section className="bg-[#174c49] px-5 py-16 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#e9a15b]">
              Why ErgoSpace
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Comfort Meets Productivity
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🌿",
                title: "Comfort Focused",
                text: "Discover products designed with everyday comfort in mind.",
              },
              {
                icon: "✨",
                title: "Thoughtfully Selected",
                text: "Explore useful accessories for your daily workspace.",
              },
              {
                icon: "🔎",
                title: "Easy Comparison",
                text: "Compare products and their features in one place.",
              },
              {
                icon: "💻",
                title: "Work Smarter",
                text: "Create a workspace that supports your productivity.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-teal-100">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE CTA */}
      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#edf4f1] px-8 py-12 text-center md:px-16">
          <h2 className="text-3xl font-bold">Find What Works for You</h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Not sure which product is right for your workspace? Compare features
            and make a choice that suits your needs.
          </p>
          <a
            href="/compare"
            className="mt-7 inline-block rounded-full bg-[#174c49] px-7 py-3.5 font-semibold text-white hover:bg-[#103b39]"
          >
            Compare Products →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#123b39] px-5 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h2 className="text-2xl font-bold">
                ErgoSpace<span className="text-[#e9a15b]">.</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-teal-100">
                Build a comfortable workspace. Make every workday better.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Explore</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <a href="/" className="hover:text-white">Home</a>
                <a href="/products" className="hover:text-white">Products</a>
                <a href="/compare" className="hover:text-white">Compare</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Account</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <a href="/login" className="hover:text-white">Login</a>
                <a href="/signup" className="hover:text-white">Sign Up</a>
               <a href="/my-orders" className="hover:text-white">My Orders</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Discover</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <a href="/about" className="hover:text-white">About ErgoSpace</a>
                <a href="/compare" className="hover:text-white">Product Comparison</a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-teal-800 pt-6 text-center text-xs text-teal-200">
            © 2026 ErgoSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
