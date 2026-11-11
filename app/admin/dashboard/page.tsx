"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";

const API_BASE = "https://ergospace-backend.onrender.com";
const API_URL = `${API_BASE}/api/products`;

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
}

const emptyForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  image: "",
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    setError("");
    setSelectedImage(file);
  }

  async function uploadImage(token: string): Promise<string> {
    if (!selectedImage) {
      return form.image.trim();
    }

    const imageData = new FormData();
    imageData.append("image", selectedImage);

    setUploading(true);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      return data.imageUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Please enter valid product details.");
      return;
    }

    setSaving(true);

    try {
      // Upload selected image to Cloudinary first.
      const imageUrl = await uploadImage(token);

      const productData = {
        name: form.name.trim(),
        category: form.category.trim(),
        price,
        description: form.description.trim(),
        image: imageUrl,
      };

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save product.");
      }

      setMessage(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setForm(emptyForm);
      setSelectedImage(null);
      setEditingId(null);

      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product._id);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image || "",
    });

    setSelectedImage(null);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setMessage("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setMessage("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ErgoSpace Admin
          </h1>
          <p className="text-gray-600">
            Product Management Dashboard
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-3xl font-bold text-gray-900">
            {products.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Admin Status</p>
          <h2 className="text-xl font-bold text-green-600">
            Logged In
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Platform</p>
          <h2 className="text-xl font-bold text-gray-900">
            ErgoSpace
          </h2>
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-lg border p-3 text-gray-900"
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
            className="rounded-lg border p-3 text-gray-900"
          />

          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            required
            className="rounded-lg border p-3 text-gray-900"
          />

          <input
            name="image"
            placeholder="Existing Image URL (optional)"
            value={form.image}
            onChange={handleChange}
            className="rounded-lg border p-3 text-gray-900"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium text-gray-700">
              Upload Product Image (maximum 5 MB)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-lg border p-3 text-gray-900"
            />

            {selectedImage && (
              <p className="mt-2 text-sm text-green-700">
                Selected: {selectedImage.name}
              </p>
            )}

            {!selectedImage && form.image && (
              <p className="mt-2 text-sm text-gray-600">
                An existing image URL is saved for this product.
              </p>
            )}
          </div>

          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="rounded-lg border p-3 text-gray-900 md:col-span-2"
          />

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {uploading
                ? "Uploading Image..."
                : saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Product List
          </h2>

          <button
            onClick={fetchProducts}
            className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3">Image</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          No image
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-medium text-gray-900">
                      {product.name}
                    </td>

                    <td className="p-3 text-gray-700">
                      {product.category}
                    </td>

                    <td className="p-3 text-gray-700">
                      ₹{product.price}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
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