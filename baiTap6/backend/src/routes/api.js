const express = require("express");

const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
} = require("../controllers/userController");

const {getProducts, getProductById, searchProducts, createProduct, updateProduct, deleteProduct} = require("../controllers/productController");

const {addFavorite, removeFavorite, listFavorites} = require("../controllers/favoriteController")

const auth = require("../middleware/auth");
const delay = require("../middleware/delay");
const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

routerAPI.get("/products", getProducts);
routerAPI.get("/products/search", searchProducts);
routerAPI.get("/products/:id", getProductById);
routerAPI.post("/products", createProduct);
routerAPI.put("/products/:id", updateProduct);
routerAPI.delete("/products/:id", deleteProduct);

routerAPI.post("/favorites/:productId",addFavorite)
routerAPI.delete("/favorites/:productId",removeFavorite)
routerAPI.get("/favorites", listFavorites)

module.exports = routerAPI; //export default

