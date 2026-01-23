import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/user-service.js";
import { CreateUserInput, LoginInput } from "../model/user-model.js";
import { logger } from "../application/logging.js";

export class UserController {
    
    static async register(req: Request, res: Response, next: NextFunction){
        try {
            const request: CreateUserInput = req.body as CreateUserInput;
            const response = await UserService.register(request);
            res.status(201).json({data: response});
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try {
            const request = req.body as LoginInput;
            const response = await UserService.login(request);
            res.status(200).json({data: response});
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }
}