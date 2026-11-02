const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const sampleProducts = [
  {
    name: "Ergonomic Laptop Stand",
    category: "Laptop Accessories",
    description: "Adjustable stand for comfortable laptop usage.",
    price: 1499,
    features: [
      "Adjustable height",
      "Aluminium body",
      "Portable design"
    ],
    image: "https://img.pacifiko.com/PROD/resize/1/500x500/YWFjZmEyZT.jpg",
  },

  {
    name: "Wrist Support Mouse Pad",
    category: "Desk Accessories",
    description: "Soft wrist support for comfortable computer usage.",
    price: 499,
    features: [
      "Memory foam",
      "Anti-slip base",
      "Wrist support"
    ],
    image: "https://img14.360buyimg.com/pop/jfs/t1/166011/29/37141/32626/64b60efbF1c1c2849/7d06086a580c1c14.png",
  },

  {
    name: "Ergonomic Office Chair",
    category: "Furniture",
    description: "Designed to support comfortable sitting posture.",
    price: 5999,
    features: [
      "Lumbar support",
      "Adjustable height",
      "Breathable material"
    ],
    image: "https://cdnus.globalso.com/szyikonglong/Weight-Sensing-Synchro-Tilter-Mesh-Back-Office-Chair-with-Adjustable-Headrest-5.jpg",
  },

  {
    name: "Monitor Riser",
    category: "Desk Accessories",
    description: "Raises your monitor to a comfortable viewing level.",
    price: 999,
    features: [
      "Space saving",
      "Strong structure",
      "Easy installation"
    ],
    image: "https://carpentray.com/cdn/shop/files/Support_pour_ecran_Gianmario_9.jpg?v=1732284880",
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");

    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);

    console.log("Four sample products added successfully!");

  } catch (error) {
    console.log("Error:", error.message);

  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();