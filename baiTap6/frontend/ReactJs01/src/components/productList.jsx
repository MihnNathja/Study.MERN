import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProducts, searchProducts } from "../util/api";

const money = new Intl.NumberFormat("vi-VN");
const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

const categoriesPreset = ["all", "Laptop", "Điện thoại", "Tai nghe", "Phụ kiện", "Tablet"];

function ProductCard({ p }) {
  return (
    <div className="rounded-2xl border p-4 hover:shadow-sm transition grid gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium line-clamp-2 leading-snug">{p.name}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700">{p.category}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="font-semibold text-base text-gray-900">₫{money.format(p.price)}</div>
        <div className="flex items-center gap-3">
          <span>👁️ {money.format(p.views || 0)}</span>
          <span>🗓 {p.createdAt ? dateFmt.format(new Date(p.createdAt)) : "—"}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNext, setHasNext] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // paging
  const pageRef = useRef(1);
  const cursorRef = useRef(null);

  // reset & fetch first page khi filter thay đổi
  const resetKeys = useMemo(
    () => ({ q, category, minPrice, maxPrice, sortBy, sortOrder, pageSize }),
    [q, category, minPrice, maxPrice, sortBy, sortOrder, pageSize]
  );
  useEffect(() => {
    setItems([]);
    setError("");
    setHasNext(true);
    setLoading(false);
    pageRef.current = 1;
    cursorRef.current = null;
    fetchMore(true);
  }, [JSON.stringify(resetKeys)]);

  const fetchMore = useCallback(
    async (isFirst = false) => {
      if (loading || !hasNext) return;
      setLoading(true);
      setError("");

      try {
        const params = {
          q,
          category: category !== "all" ? category : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sortBy,
          sortOrder,
          limit: pageSize,
        };
        if (cursorRef.current) {
          try {
            params.searchAfter = JSON.parse(cursorRef.current);
          } catch {
            params.searchAfter = cursorRef.current;
          }
        }
        console.log("searchProducts params:", params);
        const res = await searchProducts(params);
        console.log("searchProducts res:", res);
        const payload = res;
        if (!payload || payload.EC !== 0) throw new Error(payload?.EM || "Không thể tải dữ liệu");
        
        const data = payload.data || [];
        const newItems = isFirst ? data : [...items, ...data]; 
        setItems((prev) => (isFirst ? data : prev.concat(data)));
        cursorRef.current = payload.nextSearchAfter || null;
        setTotal(payload.total || 0); 
        setHasNext(
          Boolean(payload.nextSearchAfter) &&
          newItems.length < (payload.total || 0)
        );
      } catch (err) {
        // fallback sang getProducts nếu search lỗi
        try {
          const res = await getProducts(category, pageRef.current, pageSize);
          const payload = res.data;
          if (!payload || payload.EC !== 0) throw new Error(payload?.EM || "Không thể tải dữ liệu");
          const data = payload.data || [];
          setItems((prev) => (isFirst ? data : prev.concat(data)));
          const total = payload.pagination?.total || 0;
          const loaded = (isFirst ? 0 : items.length) + data.length;
          const more = loaded < total;
          setHasNext(more);
          if (more) pageRef.current += 1;
        } catch (err2) {
          setError(err2.message || String(err2));
          setHasNext(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [q, category, minPrice, maxPrice, sortBy, sortOrder, pageSize, loading, hasNext, items.length]
  );

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

  const clearFilters = () => {
    setQ("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("name");
    setSortOrder("desc");
    setPageSize(12);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Tìm kiếm</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập tên sản phẩm..."
            className="h-10 rounded-xl border px-3" />
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Danh mục</span>
          <div className="flex flex-wrap gap-2">
            {categoriesPreset.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-sm border ${category === c ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Giá tối thiểu</span>
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/\\D/g, ""))}
              className="h-10 rounded-xl border px-3" />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Giá tối đa</span>
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/\\D/g, ""))}
              className="h-10 rounded-xl border px-3" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Sắp xếp theo</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 rounded-xl border px-3">
              <option value="name">Tên</option>
              <option value="price">Giá</option>
              <option value="views">Lượt xem</option>
              <option value="createdAt">Ngày tạo</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Thứ tự</span>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-10 rounded-xl border px-3">
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
          {/* <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Số lượng / lần tải</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-10 rounded-xl border px-3">
              {[6, 12, 24, 48].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div> */}
        </div>
      </div>

      <button onClick={clearFilters} className="text-sm px-3 py-2 rounded border hover:bg-gray-50 w-fit">Xoá lọc</button>

      {/* List */}
      {error && <div className="p-3 rounded-xl border bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p, idx) => <ProductCard key={(p.id || p._id || idx) + "_" + idx} p={p} />)}
      </div>

      <div className="flex justify-center py-2">
        <button onClick={() => fetchMore()} disabled={loading || !hasNext}
          className={`px-4 py-2 rounded border ${loading || !hasNext ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}>
          {loading ? "Đang tải..." : hasNext ? "Tải thêm" : "Hết kết quả"}
        </button>
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
