// updateESUuid.js
const mongoose = require("mongoose");
const { Client } = require("@elastic/elasticsearch");
const Product = require("./src/models/Product");

const esClient = new Client({ node: "http://localhost:9200" }); // thay URL nếu cần

// 1️⃣ Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/fullstack02", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// 2️⃣ Hàm đảm bảo mapping uuid có trong ES
async function ensureUuidMapping() {
  const index = "products";
  const exists = await esClient.indices.exists({ index });
  if (!exists) {
    // tạo index mới với mapping uuid
    await esClient.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            name: { type: "text" },
            price: { type: "double" },
            category: { type: "keyword" },
            views: { type: "integer" },
            createdAt: { type: "date" },
            uuid: { type: "keyword" } // tie-breaker
          }
        }
      }
    });
    console.log("Created index with uuid mapping");
  } else {
    // kiểm tra mapping
    const mapping = await esClient.indices.getMapping({ index });
    if (!mapping[index].mappings.properties.uuid) {
      // cập nhật mapping (chỉ có thể thêm field mới)
      await esClient.indices.putMapping({
        index,
        body: {
          properties: {
            uuid: { type: "keyword" }
          }
        }
      });
      console.log("Updated mapping: added uuid");
    }
  }
}

// 3️⃣ Reindex/update tất cả document từ MongoDB
async function reindexProducts() {
  const products = await Product.find(); // MongoDB
  console.log(`Found ${products.length} products in MongoDB`);

  for (let p of products) {
    await esClient.index({
      index: "products",
      id: p._id.toString(),
      body: {
        name: p.name,
        price: p.price,
        category: p.category,
        views: p.views,
        createdAt: p.createdAt,
        uuid: p.uuid
      }
    });
  }

  await esClient.indices.refresh({ index: "products" });
  console.log("All products indexed with uuid into Elasticsearch");
}

// 4️⃣ Chạy toàn bộ
mongoose.connection.once("open", async () => {
  try {
    await ensureUuidMapping();
    await reindexProducts();
    console.log("Done! You can now use composite sort [createdAt, uuid]");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
});
