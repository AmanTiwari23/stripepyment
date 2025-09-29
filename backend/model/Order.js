import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    amount: { type: Number, required: true }, // total in cents
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
