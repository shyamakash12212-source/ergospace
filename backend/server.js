require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cloudinary = require("./cloudinary");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Product = require("./models/Product");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const Customer = require("./models/Customer");
const verifyCustomer = require("./middleware/customerAuth");
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
   allowedHeaders: [
  "Content-Type",
  "Authorization",
  "X-Order-Tracking-Token",
],
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
 // Create website order (guest checkout)
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items } = req.body;

    // Validate customer details
    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid customer and delivery details.",
      });
    }

    // Validate cart
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Verify products and calculate total using database prices
    for (const item of items) {
      const productId = item.productId || item._id;

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity.",
        });
      }

      const product = await Product.findById(productId);

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

       // Generate secure guest order tracking token
    const trackingToken = crypto.randomBytes(32).toString("hex");

    const trackingTokenHash = crypto
      .createHash("sha256")
      .update(trackingToken)
      .digest("hex");

    // Save order to MongoDB
    const order = await Order.create({
      customerId: null,
      trackingTokenHash,
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
      trackingToken,
    });
  } catch (error) {
    console.error("Website order error:", error.message);

    return res.status(500).json({
      message: "Unable to place your order.",
    });
  }
});
// Get guest order status using tracking token
app.get("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.get("X-Order-Tracking-Token");

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      typeof token !== "string" ||
      token.length !== 64
    ) {
      return res.status(400).json({
        message: "Invalid order tracking request.",
      });
    }

    const trackingTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const order = await Order.findOne({
      _id: id,
      trackingTokenHash,
    }).select("status createdAt");

    if (!order) {
      return res.status(404).json({
        message: "Order tracking information not found.",
      });
    }

    return res.status(200).json({
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Guest order status error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch order status.",
    });
  }
});
// Create order for logged-in mobile customer
app.post("/api/customer/orders", verifyCustomer, async (req, res) => {
  try {
    const { address, items } = req.body;

    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({
        message: "Please provide a valid delivery address.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    const customer = await Customer.findById(req.customer.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
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
      customerId: customer._id,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: address.trim(),
      },
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Customer order error:", error.message);

    return res.status(500).json({
      message: "Unable to place your order.",
    });
  }
});

// Get logged-in customer's order history
app.get("/api/customer/orders", verifyCustomer, async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.customer.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Customer order history error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch your order history.",
    });
  }
});

// Get all orders (Admin only)
app.get("/api/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error.message);

    res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
});

// Update order status (Admin only)
app.patch(
  "/api/admin/orders/:id/status",
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      res.status(200).json({
        message: "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error.message);

      res.status(500).json({
        message: "Unable to update order status.",
      });
    }
  }
);

// Customer signup
app.post("/api/customer/signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      !/^\d{10}$/.test(phone.trim()) ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Enter a valid name, 10-digit phone number and password (minimum 8 characters).",
      });
    }

    const existingCustomer = await Customer.findOne({
      phone: phone.trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "This phone number is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: customer._id.toString(),
        role: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Customer registered successfully.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Customer signup error:", error.message);

    return res.status(500).json({
      message: "Unable to register customer.",
    });
  }
});


// Customer login
app.post("/api/customer/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !/^\d{10}$/.test(phone.trim()) ||
      !password
    ) {
      return res.status(400).json({
        message: "Enter a valid phone number and password.",
      });
    }

    const customer = await Customer.findOne({
      phone: phone.trim(),
    }).select("+password");

    if (!customer) {
      return res.status(401).json({
        message: "Invalid phone number or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid phone number or password.",
      });
    }

    const token = jwt.sign(
      {
        id: customer._id.toString(),
        role: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Customer login successful.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    return res.status(500).json({
      message: "Unable to login.",
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