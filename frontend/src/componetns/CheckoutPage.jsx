import React, { useState } from "react";
import { useSelector } from "react-redux";

const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const [email, setEmail] = useState("");

  const handleCheckout = async () => {
    if (!email) {
      alert("Please enter your email before checkout.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // ✅ Stripe Checkout redirect
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      alert("Payment failed to start.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      <input
        type="email"
        placeholder="Enter your email"
        className="border p-2 w-full mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleCheckout}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CheckoutPage;
