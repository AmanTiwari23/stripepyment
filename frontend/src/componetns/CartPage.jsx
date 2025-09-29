import { useSelector, useDispatch } from "react-redux";
import { removeItem } from "../features/cartSlice";
import { Link } from "react-router-dom";

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <h2 className="text-2xl mb-4">Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between bg-white p-2 mb-2 rounded">
              <span>{i.name} x {i.quantity}</span>
              <div className="flex gap-2">
                <span>₹ {i.price * i.quantity}</span>
                <button onClick={() => dispatch(removeItem(i.id))} className="text-red-600">X</button>
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-between">
            <span className="font-semibold">Total: ₹ {total}</span>
            <Link to="/checkout" className="bg-green-600 text-white px-4 py-2 rounded">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
