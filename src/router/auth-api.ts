import express from "express";
import { UserController } from "../controller/user-controller.js";
import { ProductController } from "../controller/product-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

export const authRouter = express.Router();
authRouter.use(authMiddleware);
authRouter.get("/api/user", UserController.getUser);
authRouter.put("/api/user", UserController.updateUser);
authRouter.post("/api/logout", UserController.logout);

//product routes
authRouter.post("/api/products", ProductController.create);
authRouter.put("/api/products/:id", ProductController.update);
authRouter.get("/api/products/:id", ProductController.getById);
authRouter.get("/api/products/barcode/:barcode", ProductController.getByBarcode);