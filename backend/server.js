require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cloudinary = require("./cloudinary");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Product = require("./models/Product");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const verifyAdmin = require("./middleware/auth");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ergospace-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

// Image upload configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image files are allowed."));
    }
  },
});

// Home route
app.get("/", (req, res) => {
  res.send("ErgoSpace API is running!");
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      message: "Unable to load products.",
    });
  }
});
// Create a new order
app.post("/api/orders", async (req, res) => {
try {
const { customer, items } = req.body;

// Validate customer details
if (
  !customer ||
  typeof customer.name !== "string" ||
  !customer.name.trim() ||
  typeof customer.phone !== "string" ||
  !/^\d{10}$/.test(customer.phone.trim()) ||
  typeof customer.address !== "string" ||
  !customer.address.trim()
) {
  return res.status(400).json({
    message: "Please provide valid customer details.",
  });
}

// Validate cart items
if (!Array.isArray(items) || items.length === 0) {
  return res.status(400).json({
    message: "Your cart is empty.",
  });
}

const orderItems = [];
let totalAmount = 0;

for (const item of items) {
  if (
    !item ||
    !mongoose.Types.ObjectId.isValid(item.productId) ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > 100
  ) {
    return res.status(400).json({
      message: "Invalid product or quantity.",
    });
  }

  const product = await Product.findById(item.productId);

  if (!product) {
    return res.status(404).json({
      message: "One of the selected products was not found.",
    });
  }

  orderItems.push({
    product: product._id,
    name: product.name,
    price: product.price,
    quantity: item.quantity,
  });

  totalAmount += product.price * item.quantity;
}

const order = await Order.create({
  customer: {
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
  },
  items: orderItems,
  totalAmount,
});

return res.status(201).json({
  message: "Order placed successfully.",
  order,
});

} catch (error) {
console.error("Create order error:", error.message);

return res.status(500).json({
  message: "Unable to place your order.",
});

}
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
        message: "Username and password are required.",
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

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    res.status(500).json({
      message: "Login failed.",
    });
  }
});

// Add product
app.post("/api/products", verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      image,
      features,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Valid name, category, description and price are required.",
      });
    }

    if (
      features !== undefined &&
      (!Array.isArray(features) ||
        !features.every((feature) => typeof feature === "string"))
    ) {
      return res.status(400).json({
        message: "Features must be an array of strings.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price,
      description: description.trim(),
      image: typeof image === "string" ? image.trim() : "",
      features: Array.isArray(features)
        ? features.map((feature) => feature.trim()).filter(Boolean)
        : [],
    });

    res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error.message);

    res.status(500).json({
      message: "Unable to add product.",
    });
  }
});

// Upload image to Cloudinary
app.post(
  "/api/upload",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ergospace/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      res.status(200).json({
        message: "Image uploaded successfully.",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error("Image upload error:", error.message);

      res.status(500).json({
        message: "Unable to upload image.",
      });
    }
  }
);

// Update product
app.put("/api/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const updates = {};

    const allowedFields = [
      "name",
      "category",
      "price",
      "description",
      "image",
      "features",
    ];

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
        message: "Product name is invalid.",
      });
    }

    if (
      updates.category !== undefined &&
      (typeof updates.category !== "string" ||
        !updates.category.trim())
    ) {
      return res.status(400).json({
        message: "Product category is invalid.",
      });
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" ||
        !updates.description.trim())
    ) {
      return res.status(400).json({
        message: "Product description is invalid.",
      });
    }

    if (
      updates.price !== undefined &&
      (typeof updates.price !== "number" ||
        !Number.isFinite(updates.price) ||
        updates.price < 0)
    ) {
      return res.status(400).json({
        message: "Product price is invalid.",
      });
    }

    if (
      updates.features !== undefined &&
      (!Array.isArray(updates.features) ||
        !updates.features.every(
          (feature) => typeof feature === "string"
        ))
    ) {
      return res.status(400).json({
        message: "Features must be an array of strings.",
      });
    }

    ["name", "category", "description", "image"].forEach(
      (field) => {
        if (typeof updates[field] === "string") {
          updates[field] = updates[field].trim();
        }
      }
    );

    if (Array.isArray(updates.features)) {
      updates.features = updates.features
        .map((feature) => feature.trim())
        .filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    res.status(500).json({
      message: "Unable to update product.",
    });
  }
});

// Delete product
app.delete("/api/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      message: "Unable to delete product.",
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller."
          : "Image upload error.",
    });
  }

  if (error.message === "Only image files are allowed.") {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed.",
    });
  }

  console.error("Server error:", error.message);

  res.status(500).json({
    message: "Internal server error.",
  });
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5001;

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    app.listen(PORT, () => {
      console.log(`ErgoSpace backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
    console.error("Error Name:", error.name);
console.error("Error Code:", error.code);
console.error("Full Error:", error);
if (error.reason?.servers) {
  for (const [address, server] of error.reason.servers) {
    console.error("Server:", address);
    console.error("Server Error:", server.error?.message || "No details");
  }
}
    process.exit(1);
  });