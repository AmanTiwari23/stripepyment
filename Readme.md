Stripe Payment Integration Backend

This is a Node.js + Express backend for handling Stripe payments with MongoDB. It supports:

Creating checkout sessions

Storing orders in MongoDB

Updating order status via Stripe webhooks (pending → paid/failed)

Features

Create orders in MongoDB when a user starts checkout

Generate Stripe Checkout sessions for card payments

Webhook updates the order status automatically on payment success or failure

Fully compatible with local development using ngrok

Project Structure
backend/
 ├─ server/
 │    ├─ index.js          # Main backend server
 │    └─ model/
 │         └─ Order.js     # Mongoose model for orders
 └─ .env                   # Environment variables

Installation

Clone the repository:

git clone <your-repo-url>
cd backend


Install dependencies:

npm install


Create a .env file in the root of the project:

STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
MONGO_URI=mongodb://127.0.0.1:27017/stripeOrders

Running Locally

Make sure MongoDB is running locally:

mongod


Start the backend:

node server/index.js


Optional: use ngrok to expose your local server for Stripe webhooks:

ngrok http 5000


Copy the public URL from ngrok (e.g., https://abcd1234.ngrok.io) for webhook configuration.

Stripe Webhook Setup

Go to Stripe Dashboard → Developers → Webhooks

Add a new webhook endpoint:

<YOUR_NGROK_URL>/webhook


Select the events:

payment_intent.succeeded

checkout.session.expired (optional)

Copy the signing secret and put it in .env as STRIPE_WEBHOOK_SECRET.

API Endpoints
1. Create Checkout Session
POST /create-checkout-session


Request Body:

{
  "email": "user@example.com",
  "cartItems": [
    {
      "name": "Classic Watch",
      "price": 1999,
      "quantity": 1,
      "image": "https://www.example.com/image.jpg"
    }
  ]
}


Response:

{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}

2. Stripe Webhook
POST /webhook


Stripe sends events here to update the order status in MongoDB

No manual request is needed; this is handled automatically

MongoDB Schema

Order Document:

{
  "_id": "ObjectId",
  "email": "user@example.com",
  "items": [
    {
      "name": "Classic Watch",
      "price": 1999,
      "quantity": 1,
      "image": "https://www.example.com/image.jpg"
    }
  ],
  "amount": 199900,
  "status": "pending | paid | failed",
  "transactionId": "pi_XXXXXXXXXXXXXXXX",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}

Testing Payments

Use Stripe test cards:

Card number: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits


After successful payment, the backend webhook will update the order status to paid.

Notes

Make sure ngrok or a public URL is used during local development to receive webhooks.

Orders will remain pending if the webhook is not received.

payment_intent.succeeded is the reliable event to mark an order as paid.