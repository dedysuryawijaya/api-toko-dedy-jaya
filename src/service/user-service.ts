import { prismaClient } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import { CreateUserInput, toUserResponse, UserResponse } from '../model/user-model.js';
import { UserValidation } from '../validation/user-validation.js';
import { Validation } from '../validation/validation.js';

export class UserService {
    static async register(input: CreateUserInput): Promise<UserResponse> {
        const registerRequest = Validation.validate<CreateUserInput>(UserValidation.REGISTER, input);

        const emailExists = await prismaClient.user.count({
            where: { email: registerRequest.email },
        });

        if (emailExists > 0) {
            throw new ResponseError('Email already in use', 400);
        }
        
        const phoneExists = await prismaClient.user.count({
            where: { phone: registerRequest.phone },
        });

        if (phoneExists > 0) {
            throw new ResponseError('Phone number already in use', 400);
        }

        const newUser = await prismaClient.user.create({
            data: registerRequest,
        });

        return toUserResponse(newUser);
    }
}