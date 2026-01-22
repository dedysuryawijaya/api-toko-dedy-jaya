import express from "express";
import { UserController } from "../controller/user-controller.js";

export const publicRouter = express.Router();
publicRouter.post("/api/register", UserController.register);