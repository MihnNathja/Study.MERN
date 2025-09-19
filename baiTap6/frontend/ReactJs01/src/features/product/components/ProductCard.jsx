import { useState } from "react";
import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("vi-VN");
const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export default function ProductCard({ p, toggleFavorite }) {
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    setLoading(true);
    await toggleFavorite(p._id || p.id);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border p-4 hover:shadow-md transition grid gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link to={`/products/${p._id || p.id}`}>
          <h3 className="font-medium line-clamp-2 leading-snug hover:text-blue-600">
            {p.name}
          </h3>
        </Link>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700">
            {p.category}
          </span>
          {p.isViewed && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border">
              👀 Đã xem
            </span>
          )}
        </div>
      </div>

      {/* Price & Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="font-semibold text-base text-gray-900">
          ₫{money.format(p.price)}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>👁️ {p.viewsCount ?? 0}</span>
          <span>🛒 {p.buyersCount ?? 0}</span>
          <span>💬 {p.commentersCount ?? 0}</span>
          <span>
            🗓 {p.createdAt ? dateFmt.format(new Date(p.createdAt)) : "—"}
          </span>
        </div>
      </div>

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        className={`px-3 py-1 rounded-full text-sm transition ${
          p.isFavorite
            ? "bg-red-500 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        {loading ? "..." : p.isFavorite ? "❤️ Đã thích" : "🤍 Yêu thích"}
      </button>
    </div>
  );
}
