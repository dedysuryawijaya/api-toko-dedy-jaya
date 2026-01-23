import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error.js";
import { ZodError } from "zod";
import { fi } from "zod/locales";

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    } else if (err instanceof ResponseError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
    } else {
        res.status(500).json({
            error: err.message,
        });
    }
};