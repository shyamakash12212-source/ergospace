const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const Product = require("./models/Product");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ErgoSpace API is running!");
});

app.get("/test", (req, res) => {
  res.send("ErgoSpace backend working successfully!");
});
// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
console.log("Products found:", products.length);
res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log("ErgoSpace backend running on port " + PORT);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });