import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/user-service.js";
import { CreateUserInput, LoginInput, toUserResponse, UpdateUserInput } from "../model/user-model.js";
import { logger } from "../application/logging.js";
import { UserRequest } from "../utils/user-request.js";
import { User } from "@prisma/client";
import { LogoutTokenInput, RefreshTokenInput } from "../model/token-model.js";

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

    static async getUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user as User;
            const response = toUserResponse(user);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async updateUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user as User;
            const input = req.body as UpdateUserInput;
            const response = await UserService.updateUser(user, input);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as RefreshTokenInput;
            const response = await UserService.refreshToken(request);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user as User;
            const deviceId = req.body as LogoutTokenInput;
            await UserService.logout(user, deviceId);
            res.status(200).json({ message: 'OK' });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }
}