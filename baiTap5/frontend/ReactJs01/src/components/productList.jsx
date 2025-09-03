import React, { useEffect, useState, useRef, useCallback } from "react";
import { getProducts } from "../util/api";
import { Card, Row, Col } from "antd";

const { Meta } = Card;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState("all"); // default category
  const loader = useRef(null);

  const fetchProducts = async (pageNum, reset = false) => {
    const res = await getProducts(category, pageNum, 6);

    if (res.EC === 0) {
      setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));

      const loaded = pageNum * 6;
      setHasMore(loaded < res.pagination.total);
    }
  };

  useEffect(() => {
    fetchProducts(page, page === 1);
  }, [page, category]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
  }, [category]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sản phẩm</h2>

      {/* Select box để chọn category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px" }}
      >
        <option value="all">Tất cả</option>
        <option value="phone">Điện thoại</option>
        <option value="laptop">Laptop</option>
        <option value="tablet">Tablet</option>
        <option value="accessory">Phụ kiện</option>
      </select>

      <Row gutter={[16, 16]}>
        {products.map((p) => (
          <Col key={p._id} xs={24} sm={12} md={8} lg={6}>
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
              <Meta
                title={p.name}
                description={`${p.price.toLocaleString()} ₫`}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {hasMore && <div ref={loader} style={{ margin: "20px", textAlign: "center" }}>Đang tải thêm...</div>}
    </div>
  );
};

export default ProductList;
