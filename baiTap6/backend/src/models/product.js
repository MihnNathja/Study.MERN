const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true }, // unique identifier
  name: { type: String, required: true },        // fuzzy search
  price: { type: Number, required: true },       // filter theo giá
  category: { type: String, required: true },    // filter theo danh mục
  viewsCount: { type: Number, default: 0 },           // tổng số lượt xem
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // id user đã xem
  buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],          // id user đã mua
  buyersCount: { type: Number, default: 0 },     // số khách mua (tự tăng)
  commenters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],      // id user đã bình luận
  commentersCount: { type: Number, default: 0 }, // số khách bình luận (tự tăng)
  createdAt: { type: Date, default: Date.now }   // sort theo ngày
});

module.exports = mongoose.model("Product", productSchema);
