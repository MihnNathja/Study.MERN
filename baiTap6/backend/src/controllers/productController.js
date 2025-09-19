const { createProductService, searchProductsService, getProductsService, getProductByIdService, addBuyerService, addViewService, addCommenterService, updateProductService, deleteProductService } = require("../services/productService");

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
    const userId = req.user.id
    const products = await searchProductsService(req.query, userId);
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

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?.id; // nếu có đăng nhập

    // 1. Tăng view trước
    await addViewService(productId, userId);

    // 2. Lấy chi tiết sản phẩm
    const product = await getProductByIdService(productId, userId);

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addBuyer = async (req, res) => {
    try {
    const productId = req.params.id;
    const userId = req.user.id;
    const product = await addBuyerService(productId, userId);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



const addCommenter = async (req, res) => {
    try {
    const productId = req.params.id;
    const product = await addCommenterService(productId);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createProduct, searchProducts, getProducts, updateProduct, deleteProduct, getProductById, addBuyer, addCommenter};
