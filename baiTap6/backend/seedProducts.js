const axios = require("axios");

const products = [
  { name: "Iphone 14 Pro Max", price: 32000000, category: "Điện thoại", views: 0 },
  { name: "Samsung Galaxy S23", price: 28000000, category: "Điện thoại", views: 0 },
  { name: "Xiaomi Redmi Note 12", price: 7000000, category: "Điện thoại", views: 0 },
  { name: "Macbook Pro 16 inch", price: 60000000, category: "Laptop", views: 0 },
  { name: "Dell XPS 13", price: 45000000, category: "Laptop", views: 0 },
  { name: "Asus ROG Strix", price: 50000000, category: "Laptop", views: 0 },
  { name: "Sony WH-1000XM5", price: 9000000, category: "Tai nghe", views: 0 },
  { name: "AirPods Pro 2", price: 6000000, category: "Tai nghe", views: 0 },
  { name: "Logitech MX Master 3", price: 2500000, category: "Phụ kiện", views: 0 },
  { name: "Samsung Galaxy Tab S8", price: 20000000, category: "Tablet", views: 0 },
  // thêm nhiều sản phẩm nếu muốn
];

const seed = async () => {
  for (let p of products) {
    try {
      await axios.post("http://localhost:8080/v1/api/products", p); // đổi port nếu backend bạn khác
      console.log("Created:", p.name);
    } catch (err) {
      console.error("Error creating", p.name, err.response?.data || err.message);
    }
  }
};


seed();
