import { prismaClient } from '../application/database.js';
import { ResponseError } from '../error/response-error.js';
import { TokenResponse, toTokenResponse } from '../model/token-model.js';
import { CreateUserInput, LoginInput, toUserResponse, UserResponse } from '../model/user-model.js';
import { signJwt } from '../utils/jwt-util.js';
import { generateRefreshToken } from '../utils/refresh-token.js';
import { UserValidation } from '../validation/user-validation.js';
import { Validation } from '../validation/validation.js';
import bcrypt from 'bcrypt';

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

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const newUser = await prismaClient.user.create({
            data: registerRequest,
        });

        return toUserResponse(newUser);
    }

    static async login(input: LoginInput): Promise<TokenResponse> {
        const loginRequest = Validation.validate<LoginInput>(UserValidation.LOGIN, input);

        const user = await prismaClient.user.findFirst({
            where: { email: loginRequest.email },
        });

        if (!user) {
            throw new ResponseError('Invalid email or password', 401);
        }

        const passwordMatch = await bcrypt.compare(loginRequest.password, user.password);
        if (!passwordMatch) {
            throw new ResponseError('Invalid email or password', 401);
        }

        const accessToken = signJwt({
            userId: user.id,
            email: user.email!,
        })

        const refreshToken = generateRefreshToken();

        const token = await prismaClient.token.create({
            data: {
                userId: user.id,
                token: refreshToken,
            },
        });

        return toTokenResponse(token, accessToken);
    }
}