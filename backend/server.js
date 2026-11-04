const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const Product = require("./models/Product");

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
res.send("ErgoSpace API is running!");
});

// Test route
app.get("/test", (req, res) => {
res.send("ErgoSpace backend working successfully!");
});

// Get all products
app.get("/api/products", async (req, res) => {
try {
const products = await Product.find();

console.log("Products found:", products.length);

res.status(200).json(products);

} catch (error) {
console.error("Error fetching products:", error.message);

res.status(500).json({
  message: "Failed to fetch products",
  error: error.message,
});

}
});

// Add a new product
app.post("/api/products", async (req, res) => {
try {
const product = new Product(req.body);
const savedProduct = await product.save();

res.status(201).json(savedProduct);

} catch (error) {
console.error("Error adding product:", error.message);

res.status(400).json({
  message: "Failed to add product",
  error: error.message,
});

}
});

// Connect to MongoDB and start server
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
console.log("MongoDB Connected Successfully!");
console.log("Connected database:", mongoose.connection.name);
console.log("Connected collection:", Product.collection.name);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("ErgoSpace backend running on port " + PORT);
});

})
.catch((error) => {
console.error("MongoDB Connection Error:", error.message);
process.exit(1);
});