import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes/web";
import sequelize from "./models";
import path from "path";
import methodOverride from "method-override";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));   
app.use("/", router);

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Route test UI
app.get("/", (req, res) => {
  res.render("index"); // render views/index.ejs
});



sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
