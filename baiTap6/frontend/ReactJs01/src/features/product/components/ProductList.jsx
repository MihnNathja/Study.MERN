// components/products/ProductList.jsx
import { useState, useRef, useEffect } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";

export default function ProductList() {
  const [filters, setFiltersState] = useState({
    q: "",
    category: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
    sortOrder: "desc",
    pageSize: 12,
  });

  const setFilters = (newValues) => setFiltersState((prev) => ({ ...prev, ...newValues }));
  const clearFilters = () =>
    setFiltersState({ q: "", category: "all", minPrice: "", maxPrice: "", sortBy: "name", sortOrder: "desc", pageSize: 12 });

  const { items, error, loading, hasNext, fetchMore, isFavorite, toggleFavorite  } = useProducts(filters);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchMore();
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchMore]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6">
      <ProductFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} />

      {error && <div className="p-3 rounded-xl border bg-red-50 text-red-700 text-sm">{error}</div>}

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p, idx) => (
        <ProductCard
          key={(p.id || p._id || idx) + "_" + idx}
          p={p}
          toggleFavorite={toggleFavorite}
        />
      ))}
    </div>


      <div className="flex justify-center py-2">
        <button
          onClick={() => fetchMore()}
          disabled={loading || !hasNext}
          className={`px-4 py-2 rounded border ${loading || !hasNext ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
        >
          {loading ? "Đang tải..." : hasNext ? "Tải thêm" : "Hết kết quả"}
        </button>
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
