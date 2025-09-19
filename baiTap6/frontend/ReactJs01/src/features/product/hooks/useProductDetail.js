// hooks/useProductDetail.js
import { useEffect, useState } from "react";
import { addView, getProductDetail } from "../services/productService";

export default function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("ProductId trong detail: ", productId);
    if (!productId) return;
    setLoading(true);
    getProductDetail(productId)
      .then(setProduct)
      .catch((err) => setError(err.message || "Error"))
      .finally(() => setLoading(false));
  }, [productId]);

  return { product, loading, error };
}

