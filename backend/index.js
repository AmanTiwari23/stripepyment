import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import Order from "./models/Order.js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));


// ✅ Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, email } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    // Calculate total
    const totalAmount = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

    // Create a temporary pending order
    const order = await Order.create({
      email,
      items: cartItems.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.qnty,
        image: i.image,
      })),
      amount: totalAmount * 100,
      status: "pending",
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.qnty,
      })),
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/failure",
      metadata: { orderId: order._id.toString() }, // 👈 attach order ID
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// ✅ Stripe Webhook to update order status
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        await Order.findByIdAndUpdate(orderId, {
          status: "paid",
          transactionId: session.payment_intent,
        });
      }

      if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        await Order.findByIdAndUpdate(orderId, {
          status: "failed",
        });
      }
    } catch (err) {
      console.error("Order update error:", err);
    }

    res.json({ received: true });
  }
);

app.listen(5000, () => console.log("Server running on port 5000"));
