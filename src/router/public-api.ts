import express from "express";
import { UserController } from "../controller/user-controller.js";
import { ProductController } from "../controller/product-controller.js";

export const publicRouter = express.Router();
publicRouter.post("/api/register", UserController.register);
publicRouter.post("/api/login", UserController.login);
publicRouter.post("/api/refresh-token", UserController.refreshToken);
publicRouter.post("/api/import-products", ProductController.importFromAPI);