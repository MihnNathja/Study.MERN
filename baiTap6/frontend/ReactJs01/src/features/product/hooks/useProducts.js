import { useState, useEffect, useRef, useCallback } from "react";
import { fetchProducts } from "../services/productService";
import { addFavorite, removeFavorite } from "../../../util/api";

export default function useProducts(filters) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNext, setHasNext] = useState(true);

  const pageRef = useRef(1);
  const cursorRef = useRef(null);

  // === FAVORITE LOGIC ===
  const toggleFavorite = useCallback(async (productId) => {
    try {
      setItems((prev) =>
        prev.map((p) =>
          (p._id || p.id) === productId
            ? { ...p, isFavorite: !p.isFavorite }
            : p
        )
      );

      // gọi API
      const target = items.find((p) => (p._id || p.id) === productId);
      if (target?.isFavorite) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  }, [items]);

  // === FETCH PRODUCTS ===
  const fetchMore = useCallback(
    async (isFirst = false) => {
      if (loading || !hasNext) return;
      setLoading(true);
      setError("");

      try {
        const { items: newData, total, nextSearchAfter } = await fetchProducts(
          filters,
          cursorRef,
          pageRef,
          filters.pageSize
        );

        console.log (newData);

        setItems((prev) => (isFirst ? newData : prev.concat(newData)));
        setTotal(total);
        cursorRef.current = nextSearchAfter;
        setHasNext(
          Boolean(nextSearchAfter) &&
            (isFirst ? newData.length : items.length + newData.length) < total
        );

        if (
          !nextSearchAfter &&
          (isFirst ? newData.length : items.length + newData.length) < total
        ) {
          pageRef.current += 1;
        }
      } catch (err) {
        setError(err.message || String(err));
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    },
    [filters, loading, hasNext, items.length]
  );

  useEffect(() => {
    setItems([]);
    setError("");
    setHasNext(true);
    setLoading(false);
    pageRef.current = 1;
    cursorRef.current = null;
    fetchMore(true);
  }, [JSON.stringify(filters)]);

  return {
    items,
    total,
    loading,
    error,
    hasNext,
    fetchMore,
    toggleFavorite,
  };
}
