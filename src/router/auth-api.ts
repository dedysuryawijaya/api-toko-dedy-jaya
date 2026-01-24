import express from "express";
import { UserController } from "../controller/user-controller.js";
import { ProductController } from "../controller/product-controller.js";
import { SaleController } from "../controller/sale-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

export const authRouter = express.Router();
authRouter.use(authMiddleware);
authRouter.get("/api/user", UserController.getUser);
authRouter.put("/api/user", UserController.updateUser);
authRouter.post("/api/logout", UserController.logout);

//product routes
authRouter.post("/api/products", ProductController.create);
authRouter.get("/api/products/search", ProductController.search);
authRouter.get("/api/products/barcode/:barcode", ProductController.getByBarcode);
authRouter.get("/api/products/:id", ProductController.getById);
authRouter.put("/api/products/:id", ProductController.update);
authRouter.delete("/api/products/:id", ProductController.delete);

//sale routes
authRouter.post("/api/sales", SaleController.createSale);