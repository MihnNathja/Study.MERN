import React, { useEffect, useState, useRef } from "react";
import { searchProducts } from "../util/api";
import { Card, Row, Col } from "antd";

const { Meta } = Card;
const LIMIT = 6;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sort, setSort] = useState("newest");

  const loaderRef = useRef(null);
  const lastSortRef = useRef(null);
  const debouncedSearch = useDebounce(search, 500);

  const getSortParams = (sort) => {
    switch (sort) {
      case "views": return { sortBy: "views", sortOrder: "desc" };
      case "priceAsc": return { sortBy: "price", sortOrder: "asc" };
      case "priceDesc": return { sortBy: "price", sortOrder: "desc" };
      default: return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

// 1. fetchProducts luôn dùng lastSortRef.current trực tiếp
const fetchProducts = async (reset = false) => {
  if (loading) return;
  setLoading(true);
  try {
    const { sortBy, sortOrder } = getSortParams(sort);
    const res = await searchProducts({
      q: debouncedSearch,
      category,
      limit: LIMIT,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
      sortBy,
      sortOrder,
      searchAfter: reset ? null : lastSortRef.current,
    });

    if (res.EC === 0 && Array.isArray(res.data)) {
      setProducts(prev => reset ? res.data : [...prev, ...res.data]);
      lastSortRef.current = res.nextSearchAfter || null;
      setHasMore(res.data.length === LIMIT && res.nextSearchAfter != null);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
    if (initialLoad) setInitialLoad(false);
  }
};

// 2. fetchNextPage trực tiếp gọi fetchProducts, không dùng useCallback
const fetchNextPage = () => {
  if (!loading && hasMore) fetchProducts(false);
};

// 3. observer
useEffect(() => {
  if (initialLoad) return;
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) fetchNextPage();
    },
    { root: null, rootMargin: "20px", threshold: 0 }
  );

  const currentLoader = loaderRef.current;
  if (currentLoader) observer.observe(currentLoader);
  return () => {
    if (currentLoader) observer.unobserve(currentLoader);
  };
}, [initialLoad, hasMore, loading]); // observer chỉ cần check các flag


  // --- Reset khi filter/search thay đổi ---
  useEffect(() => {
    lastSortRef.current = null;
    setProducts([]);
    setHasMore(true);
    setInitialLoad(true);
  }, [debouncedSearch, category, priceRange.min, priceRange.max, sort]);

  // --- Fetch lần đầu ---
  useEffect(() => {
    if (initialLoad) fetchProducts(true);
  }, [initialLoad]);

  // --- Lazy load ---
  useEffect(() => {
    if (initialLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { root: null, rootMargin: "20px", threshold: 0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [initialLoad, hasMore, loading]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sản phẩm</h2>

      {/* Search & Filters */}
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{ margin: "0 10px 10px 10px", padding: "5px" }}
      >
        <option value="all">Tất cả</option>
        <option value="Điện thoại">Điện thoại</option>
        <option value="Laptop">Laptop</option>
        <option value="Tablet">Tablet</option>
        <option value="Phụ kiện">Phụ kiện</option>
      </select>
      <input
        type="number"
        placeholder="Giá từ"
        value={priceRange.min}
        onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
        style={{ width: "80px", marginRight: "5px" }}
      />
      <input
        type="number"
        placeholder="Đến"
        value={priceRange.max}
        onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
        style={{ width: "80px", marginRight: "10px" }}
      />
      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value="newest">Mới nhất</option>
        <option value="views">Nhiều lượt xem</option>
        <option value="priceAsc">Giá tăng dần</option>
        <option value="priceDesc">Giá giảm dần</option>
      </select>

      {/* Products */}
      <Row gutter={[16, 16]}>
        {products.map(p => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  alt={p.name}
                  src={p.image || "https://mcdn.coolmate.me/image/March2023/meme-meo-cute-hai-huoc-1297_590.jpg"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
            >
              <Meta title={p.name} description={`${p.price.toLocaleString()} ₫`} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Loader */}
      {hasMore && (
        <div
          ref={loaderRef}
          style={{ height: "40px", margin: "20px", textAlign: "center" }}
        >
          {loading ? "Đang tải..." : "Kéo xuống để tải thêm..."}
        </div>
      )}
    </div>
  );
};

export default ProductList;
