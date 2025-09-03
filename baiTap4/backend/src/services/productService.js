const Product = require("../models/Product");

const getProductsService = async (category, page, limit) => {
  try {
    const query = category ? { category } : {};

    if (category == "all") {
      delete query.category;
    }

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return {
      EC: 0,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    };
  } catch (error) {
    console.error(error);
    return { EC: 1, EM: "Server error" };
  }
};



module.exports = {
    getProductsService
};