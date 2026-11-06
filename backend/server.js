const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Product = require("./models/Product");
const Admin = require("./models/Admin");
const verifyAdmin = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors({
  origin: "https://ergospace-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "20kb" }));

// Home route
app.get("/", (req, res) => {
  res.send("ErgoSpace API is running!");
});

// Admin login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Valid username and password are required.",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Admin login successful.",
      token,
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

// Get all products (Public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json(products);

  } catch (error) {
    console.error("Fetch error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
});

// Add product (Admin only)
app.post("/api/products", verifyAdmin, async (req, res) => {
  try {
    const { name, category, description, price, image, features } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Please provide valid product details.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      image: typeof image === "string" ? image.trim() : "",
      features: Array.isArray(features) ? features : [],
    });

    return res.status(201).json({
      message: "Product added successfully.",
      product,
    });

  } catch (error) {
    console.error("Add product error:", error.message);

    return res.status(400).json({
      message: "Failed to add product.",
    });
  }
});

// Edit product (Admin only)
app.put("/api/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "description",
      "price",
      "image",
      "features",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
      });
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Invalid product name.",
      });
    }

    if (
      updates.category !== undefined &&
      (typeof updates.category !== "string" || !updates.category.trim())
    ) {
      return res.status(400).json({
        message: "Invalid category.",
      });
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" || !updates.description.trim())
    ) {
      return res.status(400).json({
        message: "Invalid description.",
      });
    }

    if (updates.price !== undefined) {
      if (
        updates.price === "" ||
        !Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0
      ) {
        return res.status(400).json({
          message: "Invalid price.",
        });
      }

      updates.price = Number(updates.price);
    }

    if (
      updates.image !== undefined &&
      typeof updates.image !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid image.",
      });
    }

    if (
      updates.features !== undefined &&
      !Array.isArray(updates.features)
    ) {
      return res.status(400).json({
        message: "Features must be an array.",
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    if (updates.image !== undefined) {
      updates.image = updates.image.trim();
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(400).json({
      message: "Failed to update product.",
    });
  }
});

// Delete product (Admin only)
app.delete("/api/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully.",
    });

  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      message: "Failed to delete product.",
    });
  }
});

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    console.log("Connected database:", mongoose.connection.name);

    const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`ErgoSpace backend running on port ${PORT}`);
});
})
.catch((error) => {
  console.error("MongoDB Connection Error:", error.message);
  process.exit(1);
});