import { prismaClient } from '../application/database.js';
import { User } from '@prisma/client';
import { ResponseError } from '../error/response-error.js';
import { CreateTokenInput, LogoutTokenInput, RefreshTokenInput, TokenResponse, toTokenResponse } from '../model/token-model.js';
import { CreateUserInput, LoginInput, toUserResponse, UpdateUserInput, UserResponse } from '../model/user-model.js';
import { signJwt } from '../utils/jwt-util.js';
import { generateRefreshToken } from '../utils/refresh-token.js';
import { UserValidation } from '../validation/user-validation.js';
import { Validation } from '../validation/validation.js';
import bcrypt from 'bcrypt';
import moment from 'moment';

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

    static async updateUser(user: User, input: UpdateUserInput): Promise<UserResponse> {
        const updateRequest = Validation.validate<UpdateUserInput>(UserValidation.UPDATE_USER, input);

        if (updateRequest.email) {
            const emailExists = await prismaClient.user.count({
                where: { 
                    email: updateRequest.email,
                    id: { not: user.id },
                },
            });

            if (emailExists > 0) {
                throw new ResponseError('email already in use', 400);
            }

            user.email = updateRequest.email;
        }

        if (updateRequest.phone) {
            const phoneExists = await prismaClient.user.count({
                where: { 
                    phone: updateRequest.phone,
                    id: { not: user.id },
                },
            });
            if (phoneExists > 0) {
                throw new ResponseError('phone number already in use', 400);
            }

            user.phone = updateRequest.phone;
        }

        if (updateRequest.password) {
            user.password = await bcrypt.hash(updateRequest.password, 10);
        }

        if (updateRequest.name) {
            user.name = updateRequest.name
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: user.id },
            data: user,
        });

        return toUserResponse(updatedUser);
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

        const tokenData: CreateTokenInput = {
            userId: user.id,
            deviceId: loginRequest.deviceId,
            token: generateRefreshToken(),
        };

        const token = await prismaClient.token.create({
            data: tokenData,
        });

        return toTokenResponse(token, accessToken);
    }

    static async refreshToken(input: RefreshTokenInput): Promise<TokenResponse> {
        const refreshRequest = Validation.validate<RefreshTokenInput>(UserValidation.REFRESH_TOKEN, input);
        const REFRESH_TOKEN_EXPIRY_DAYS = process.env.REFRESH_TOKEN_EXPIRY_DAYS || 30;
        const existingToken = await prismaClient.token.findFirst({
            where: { 
                token: refreshRequest.token,
                deviceId: refreshRequest.deviceId,
                createdAt: { gte: moment().subtract(Number(REFRESH_TOKEN_EXPIRY_DAYS), 'days').toDate()}
            },
        });

        if (!existingToken) {
            throw new ResponseError('Invalid refresh token', 401);
        }

        const user = await prismaClient.user.findUnique({
            where: { id: existingToken.userId },
        });

        if (!user) {
            throw new ResponseError('User not found', 404);
        }

        const accessToken = signJwt({
            userId: user.id,
            email: user.email!,
        })

        return toTokenResponse(existingToken, accessToken);
    }

    static async logout(user: User, input: LogoutTokenInput): Promise<void> {
        const logoutRequest = Validation.validate<LogoutTokenInput>(UserValidation.DEVICEID, input);
        await prismaClient.token.deleteMany({
            where: { 
                userId: user.id, 
                deviceId: logoutRequest.deviceId 
            },
        });
    }
}