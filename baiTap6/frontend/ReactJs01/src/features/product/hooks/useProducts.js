// hooks/useProducts.js
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchProducts } from "../services/productService";
import { addFavorite, removeFavorite, fetchFavorites } from "../../../util/api"
export default function useProducts(filters) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNext, setHasNext] = useState(true);

  const [favorites, setFavorites] = useState(new Set()); // lưu danh sách favorites

  const pageRef = useRef(1);
  const cursorRef = useRef(null);

  // === FAVORITE LOGIC ===
  const isFavorite = useCallback(
    (productId) => favorites.has(productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      console.log(productId);
      try {
        if (favorites.has(productId)) {
          await removeFavorite(productId);
          setFavorites((prev) => {
            const copy = new Set(prev);
            copy.delete(productId);
            return copy;
          });
        } else {
          await addFavorite(productId);
          setFavorites((prev) => new Set(prev).add(productId));
        }
      } catch (err) {
        console.error("Toggle favorite error:", err);
      }
    },
    [favorites]
  );

  // Load favorites ban đầu (optional)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await fetchFavorites();
        setFavorites(new Set(favs.map((f) => f.product.id)));
      } catch (err) {
        console.error("Fetch favorites error:", err);
      }
    };
    loadFavorites();
  }, []);

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
    // favorites
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
