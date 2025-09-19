// components/products/ProductDetail.jsx
import useProductDetail from "../hooks/useProductDetail";
import useRelatedProducts from "../hooks/useRelatedProducts"; // <-- hook gợi ý
import ProductCard from "./ProductCard"; // component hiển thị 1 sản phẩm nhỏ

const money = new Intl.NumberFormat("vi-VN");
const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export default function ProductDetail({ productId }) {
  const { product, loading, error } = useProductDetail(productId);
  const { related, loading: loadingRelated, isFavorite, toggleFavorite } = useRelatedProducts(productId,  product?.category);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!product) return <div className="p-4">Không tìm thấy sản phẩm</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 grid gap-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>

      <div className="text-lg font-semibold text-red-500">
        ₫{money.format(product.price)}
      </div>

      <div className="flex gap-6 text-gray-600">
        <span>📂 {product.category}</span>
        <span>👁 {money.format(product.viewsCount || 0)} lượt xem</span>
        <span>
          🗓 {product?.createdAt ? dateFmt.format(new Date(product.createdAt)) : "—"}
        </span>
      </div>

      {/* Sau này có thể thêm ảnh, mô tả, đánh giá, nút mua */}
      <div className="mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          🛒 Thêm vào giỏ
        </button>
      </div>

      {/* --- Danh sách sản phẩm tương tự --- */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Sản phẩm tương tự</h2>
        {loadingRelated ? (
          <div>Đang tải sản phẩm tương tự...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {related?.map((p) => (
              <div key={p.id} className="min-w-[200px]">
                 <ProductCard p={p} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
