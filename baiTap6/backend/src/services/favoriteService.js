import FavoriteProduct from "../models/favoriteProduct.js";

export const addFavoriteService = async (userId, productId, note = null) => {
    try {
      const favorite = await FavoriteProduct.findOneAndUpdate(
        { user: userId, product: productId },
        { $setOnInsert: { note } },
        { new: true, upsert: true } // nếu chưa có thì tạo mới
      );
      return favorite;
    } catch (err) {
      throw new Error("Không thể thêm sản phẩm vào danh sách yêu thích");
    }
  }

export const removeFavoriteService = async (userId, productId) => {
    const result = await FavoriteProduct.findOneAndDelete({
        user: userId,
        product: productId,
    });

    if (!result) {
        throw new Error("Sản phẩm không có trong danh sách yêu thích");
    }
    return result;
}

export const listFavoritesService = async (userId, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;

    const favorites = await FavoriteProduct.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FavoriteProduct.countDocuments({ user: userId });

    return {
      data: favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
