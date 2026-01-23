import express from "express";
import { UserController } from "../controller/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

export const authRouter = express.Router();
authRouter.use(authMiddleware);
authRouter.get("/api/user", UserController.getUser);