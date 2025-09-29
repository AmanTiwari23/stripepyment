import products from "../data/Products";
import { useDispatch } from "react-redux";
import { addItem } from "../features/cartSlice";

export default function ProductList() {
  const dispatch = useDispatch();

  return (
    <div>
      <h2 className="text-2xl mb-4">Products</h2>
      <div className="grid sm:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <img src={p.image} alt={p.name} className="h-40 w-full object-cover rounded" />
            <h3 className="mt-2 font-semibold">{p.name}</h3>
            <p>₹ {p.price}</p>
            <button
              onClick={() => dispatch(addItem(p))}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
