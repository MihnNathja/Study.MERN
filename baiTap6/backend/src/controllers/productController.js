const { createProductService, searchProductsService, getProductsService } = require("../services/productService");

const createProduct = async (req, res) => {
  try {
    const product = await createProductService(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const products = await searchProductsService(req.query);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, page, limit } = req.query;
    const products = await getProductsService(category, page, limit);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await updateProductService(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await deleteProductService(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createProduct, searchProducts, getProducts, updateProduct, deleteProduct };
