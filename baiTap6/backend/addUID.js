const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Product = require("./src/models/Product");

// 1. Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/yourDBName", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// 2. Thêm uuid cho document cũ
async function addUuidToExistingProducts() {
  try {
    const products = await Product.find({ uuid: { $exists: false } });
    for (let product of products) {
      product.uuid = uuidv4();
      await product.save();
    }
    console.log("Updated all existing products with uuid");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

mongoose.connection.once("open", addUuidToExistingProducts);