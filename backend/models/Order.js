const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
customer: {
name: {
type: String,
required: true,
trim: true,
},
phone: {
type: String,
required: true,
trim: true,
},
address: {
type: String,
required: true,
trim: true,
},
},

items: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
],

totalAmount: {
  type: Number,
  required: true,
  min: 0,
},

status: {
  type: String,
  enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
  default: "Pending",
},

},
{
timestamps: true,
}
);

module.exports = mongoose.model("Order", orderSchema);