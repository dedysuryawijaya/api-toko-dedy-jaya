import { Response, NextFunction } from "express";
import { UserRequest } from "../utils/user-request.js";
import { verifyJwt } from "../utils/jwt-util.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

export const authMiddleware =  async (
    req: UserRequest,
    res: Response,
    next: NextFunction
) => {
    const auth = req.headers.authorization;
    if (!auth) {
        throw new ResponseError("Unauthorized", 401);   
    };

    const token = auth.replace("Bearer ", "");
    const decode =  verifyJwt(token);
    if (!decode) {
        throw new ResponseError("Unauthorized", 401);
    }

    const user = await prismaClient.user.findFirst({
        where: {
            id: decode.userId
        }
    });

    if (!user) {
        throw new ResponseError("Unauthorized", 401);
    }
    
    req.user = user;
    next();

}