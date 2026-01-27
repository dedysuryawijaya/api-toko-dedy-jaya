import express from "express";
import { publicRouter } from "./router/public-api.js";
import { errorMiddleware } from "./middleware/error-middleware.js";
import { authRouter } from "./router/auth-api.js";

const web = express();
web.use(express.json());
web.use(publicRouter);
web.use(authRouter);
web.use(errorMiddleware);

export default web;