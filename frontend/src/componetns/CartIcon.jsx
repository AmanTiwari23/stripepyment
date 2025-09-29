import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function CartIcon() {
  const items = useSelector((s) => s.cart.items);
  const count = items.reduce((t, i) => t + i.quantity, 0);

  return (
    <Link to="/cart" className="relative">
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6H20" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2">
          {count}
        </span>
      )}
    </Link>
  );
}
