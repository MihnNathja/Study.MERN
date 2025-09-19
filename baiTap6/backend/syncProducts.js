// reindexProducts.js
const mongoose = require("mongoose");
const esClient = require("./elsasticsearch"); // đường dẫn tới file esClient của bạn
const Product = require("./src/models/product"); // đường dẫn tới model Product

const run = async () => {
  try {
    // 1. Kết nối MongoDB
    await mongoose.connect("mongodb://localhost:27017/fullstack02");
    console.log("✅ Connected to MongoDB");

    // 2. Xoá index cũ nếu có
    try {
      await esClient.indices.delete({ index: "products" });
      console.log("🗑️ Deleted old index: products");
    } catch (err) {
      if (err.meta && err.meta.statusCode !== 404) throw err;
      console.log("ℹ️ No old index to delete");
    }

    // 3. Tạo lại index với mapping đúng theo model
    await esClient.indices.create({
      index: "products",
      body: {
        mappings: {
          properties: {
            uuid: { type: "keyword" },
            name: {
              type: "text",
              fields: {
                keyword: { type: "keyword", ignore_above: 256 },
              },
            },
            category: { type: "keyword" },
            price: { type: "float" },
            createdAt: { type: "date" },

            viewsCount: { type: "integer" },
            buyersCount: { type: "integer" },
            commentersCount: { type: "integer" },

            // các array userId (string)
            views: { type: "keyword" },
            buyers: { type: "keyword" },
            commenters: { type: "keyword" },
          },
        },
      },
    });
    console.log("✅ Created index with new mapping");

    // 4. Lấy dữ liệu từ MongoDB
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products in MongoDB`);

    // 5. Index lại vào Elasticsearch
    for (const p of products) {
      await esClient.index({
        index: "products",
        id: p._id.toString(), // dùng _id làm id trong ES
        document: {
          uuid: p.uuid,
          name: p.name,
          price: p.price,
          category: p.category,
          createdAt: p.createdAt,

          viewsCount: p.viewsCount || 0,
          buyersCount: p.buyersCount || 0,
          commentersCount: p.commentersCount || 0,

          views: p.views?.map((u) => u.toString()) || [],
          buyers: p.buyers?.map((u) => u.toString()) || [],
          commenters: p.commenters?.map((u) => u.toString()) || [],
        },
      });
      console.log(`✅ Indexed product: ${p.name}`);
    }

    // 6. Refresh index để query ngay
    await esClient.indices.refresh({ index: "products" });
    console.log("🔄 Refreshed index");

    console.log("🎉 Reindex done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

run();
