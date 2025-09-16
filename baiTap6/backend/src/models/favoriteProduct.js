const mongoose = require("mongoose");

const favoriteProductSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // tự động tạo createdAt, updatedAt
  }
);

// Một user không thể favorite cùng một product 2 lần
favoriteProductSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("FavoriteProduct", favoriteProductSchema);
