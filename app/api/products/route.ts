import mongoose from "mongoose";


const MONGO_URI = process.env.MONGO_URI;

const productSchema = new mongoose.Schema({
name: {
type: String,
required: true,
},
description: {
type: String,
required: true,
},
price: {
type: Number,
required: true,
},
category: {
type: String,
required: true,
},
image: {
type: String,
default: "",
},
features: {
type: [String],
default: [],
},
});

const Product =
mongoose.models.Product ||
mongoose.model("Product", productSchema);

async function connectDB() {
if (!MONGO_URI) {
throw new Error("MONGO_URI is not configured");
}

if (mongoose.connection.readyState !== 1) {
await mongoose.connect(MONGO_URI);
}
}

// GET all products
export async function GET() {
try {
await connectDB();

const products = await Product.find();

return Response.json(products);

} catch (error) {
console.error("Product fetch error:", error);

return Response.json(
  { message: "Unable to load products" },
  { status: 500 }
);

}
}

// ADD a product
export async function POST(request: Request) {
try {
await connectDB();

const body = await request.json();

const product = await Product.create(body);

return Response.json(product, { status: 201 });

} catch (error) {
console.error("Product creation error:", error);

return Response.json(
  { message: "Unable to add product" },
  { status: 400 }
);

}
}