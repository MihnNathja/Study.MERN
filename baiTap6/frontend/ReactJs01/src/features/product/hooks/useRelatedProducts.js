// useRelatedProducts.js
import useProducts from "./useProducts";

export default function useRelatedProducts(productId, category) {
  const { items, loading, error, isFavorite, toggleFavorite } = useProducts(
    category ? { category, pageSize: 10 } : {}
  );

  const related = (items || []).filter(
    (p) => p.id !== productId && p.id !== productId
  );

  return {
    related,
    loading,
    error,
    isFavorite,
    toggleFavorite,
  };
}
