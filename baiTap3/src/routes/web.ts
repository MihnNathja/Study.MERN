import { Router } from "express";
import * as userController from "../controllers/userController";
import methodOverride from "method-override";

const router = Router();
router.use(methodOverride("_method"));

// Render list
router.get("/", userController.renderList);
// Render edit form
router.get("/users/:id/edit", userController.renderEdit);

// API CRUD
router.post("/users", userController.create);
router.get("/users", userController.findAll);
router.get("/users/:id", userController.findOne);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.remove);

export default router;
