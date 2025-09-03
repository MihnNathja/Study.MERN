const { getProductsService } = require("../services/productService");

const getProducts = async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;

  const data = await getProductsService(category, page, limit);

  return res.status(200).json(data);
};

module.exports = { getProducts };
