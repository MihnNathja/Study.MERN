require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/product");


const categories = ["phone", "laptop", "tablet", "accessory"];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to DB");

    // Xoá sạch dữ liệu cũ
    await Product.deleteMany({});
    console.log("🗑️ Old products removed");

    // Tạo dữ liệu giả
    const products = [];
    for (let i = 1; i <= 100; i++) {
      products.push({
        name: `Product ${i}`,
        price: Math.floor(Math.random() * 1000 + 100) * 1000,
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }

    await Product.insertMany(products);
    console.log("✅ Inserted sample products:", products.length);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
};

seedProducts();
