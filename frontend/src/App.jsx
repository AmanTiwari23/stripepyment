import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./componetns/ProductList";
import CartPage from "./componetns/CartPage";
import CheckoutPage from "./componetns/CheckoutPage";
import Success from "./componetns/Success";
import Fail from "./componetns/Fail";
import CartIcon from "./componetns/CartIcon";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between">
        <Link to="/" className="text-xl font-bold">
          My Shop
        </Link>
        <CartIcon />
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<ProductList />} />
            <Route path="/home" element={<ProductList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/fail" element={<Fail />} />
        </Routes>
      </main>
    </div>
  );
}