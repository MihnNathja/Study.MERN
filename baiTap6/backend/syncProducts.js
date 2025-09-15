// syncProducts.js
const mongoose = require("mongoose");
const esClient = require("./elsasticsearch"); // đường dẫn tới file esClient bạn đã dùng
const Product = require("./src/models/Product");  // đường dẫn tới model Product

const run = async () => {
  try {
    // 1. Kết nối MongoDB
    await mongoose.connect("mongodb://localhost:27017/fullstack02"); // đổi YOUR_DB_NAME cho đúng
    console.log("✅ Connected to MongoDB");

    // 2. Xoá index cũ nếu có
    try {
      await esClient.indices.delete({ index: "products" });
      console.log("🗑️ Deleted old index: products");
    } catch (err) {
      if (err.meta && err.meta.statusCode !== 404) {
        throw err;
      }
      console.log("ℹ️ No old index to delete");
    }

    // 3. Tạo lại index với mapping chuẩn
    await esClient.indices.create({
      index: "products",
      body: {
        mappings: {
          properties: {
            name: {
              type: "text",
              fields: {
                keyword: { type: "keyword", ignore_above: 256 },
              },
            },
            category: { type: "keyword" },
            price: { type: "float" },
            views: { type: "integer" },
            createdAt: { type: "date" },
            uuid: { type: "keyword" },
          },
        },
      },
    });
    console.log("✅ Created index with mapping");

    // 4. Lấy dữ liệu từ MongoDB
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products in MongoDB`);

    // 5. Index lại vào Elasticsearch
    for (const p of products) {
      await esClient.index({
        index: "products",
        id: p._id.toString(), // dùng _id của Mongo làm id ES
        document: {
          name: p.name,
          price: p.price,
          category: p.category,
          views: p.views,
          createdAt: p.createdAt,
          uuid: p._id.toString(),
        },
      });
      console.log(`✅ Indexed product: ${p.name}`);
    }

    // 6. Refresh index để dữ liệu có thể query ngay
    await esClient.indices.refresh({ index: "products" });
    console.log("🔄 Refreshed index");

    console.log("🎉 Sync done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

run();
