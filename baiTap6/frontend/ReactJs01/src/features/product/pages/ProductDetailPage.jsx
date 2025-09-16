// pages/ProductDetailPage.jsx
import { useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";

export default function ProductDetailPage() {
  const { id } = useParams(); // lấy id từ URL
  return <ProductDetail productId={id} />;
}
