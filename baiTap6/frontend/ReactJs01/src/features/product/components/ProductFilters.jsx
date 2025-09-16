// components/products/ProductFilters.jsx
const categoriesPreset = ["all", "Laptop", "Điện thoại", "Tai nghe", "Phụ kiện", "Tablet"];

export default function ProductFilters({ filters, setFilters, clearFilters }) {
  const { q, category, minPrice, maxPrice, sortBy, sortOrder } = filters;

  return (
    <div className="grid gap-4">
      {/* Search */}
      <input
        value={q}
        onChange={(e) => setFilters({ q: e.target.value })}
        placeholder="Nhập tên sản phẩm..."
        className="h-10 rounded-xl border px-3"
      />

      {/* Category */}
      <div className="flex flex-wrap gap-2">
        {categoriesPreset.map((c) => (
          <button
            key={c}
            onClick={() => setFilters({ category: c })}
            className={`px-3 py-1 rounded-full text-sm border ${
              category === c ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Price */}
      <div className="flex gap-2">
        <input
          value={minPrice}
          onChange={(e) => setFilters({ minPrice: e.target.value.replace(/\D/g, "") })}
          placeholder="Giá tối thiểu"
          className="h-10 rounded-xl border px-3"
        />
        <input
          value={maxPrice}
          onChange={(e) => setFilters({ maxPrice: e.target.value.replace(/\D/g, "") })}
          placeholder="Giá tối đa"
          className="h-10 rounded-xl border px-3"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <select value={sortBy} onChange={(e) => setFilters({ sortBy: e.target.value })} className="h-10 rounded-xl border px-3">
          <option value="name">Tên</option>
          <option value="price">Giá</option>
          <option value="views">Lượt xem</option>
          <option value="createdAt">Ngày tạo</option>
        </select>
        <select value={sortOrder} onChange={(e) => setFilters({ sortOrder: e.target.value })} className="h-10 rounded-xl border px-3">
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
      </div>

      <button onClick={clearFilters} className="text-sm px-3 py-2 rounded border hover:bg-gray-50 w-fit">
        Xoá lọc
      </button>
    </div>
  );
}
