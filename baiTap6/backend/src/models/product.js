const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true }, // unique identifier
  name: { type: String, required: true },        // fuzzy search
  price: { type: Number, required: true },       // filter theo giá
  category: { type: String, required: true },    // filter theo danh mục
  views: { type: Number, default: 0 },           // filter/sort theo lượt xem
  createdAt: { type: Date, default: Date.now }   // sort theo ngày
});

module.exports = mongoose.model("Product", productSchema);
