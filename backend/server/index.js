import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import Order from "../model/Order.js"; // correct path

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));

// ✅ Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, email } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0)
      return res.status(400).json({ error: "Cart items required" });

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );

    // Create a pending order
    let order;
    try {
      order = await Order.create({
        email,
        items: cartItems.map((i) => ({
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
          image: i.image,
        })),
        amount: totalAmount * 100,
        status: "pending",
      });
      console.log("Order saved to DB ✅", order);
    } catch (err) {
      console.error("Error saving order ❌", err);
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name, images: [item.image] },
          unit_amount: Number(item.price) * 100,
        },
        quantity: Number(item.quantity) || 1,
      })),
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/failure",
      metadata: { orderId: order._id.toString() }, // attach order ID
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout session error ❌", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// ✅ Stripe Webhook
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature error ❌", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      console.log("Received Stripe event:", event.type);

      // ✅ Use payment_intent.succeeded to mark order as paid
      if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      transactionId: paymentIntent.id,
    });
  }
}
      // ✅ Optional: Checkout session expired
      if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        console.log("Updating Order ID to failed ❌:", orderId);

        await Order.findByIdAndUpdate(orderId, { status: "failed" });
      }
    } catch (err) {
      console.error("Order update error ❌", err);
    }

    res.json({ received: true });
  }
);

// Start server
app.listen(5000, () => console.log("Server running on port 5000 🚀"));
