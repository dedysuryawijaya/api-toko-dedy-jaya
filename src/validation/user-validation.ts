import { z, ZodType } from 'zod';
import { CreateUserInput, LoginInput, UpdateUserInput } from '../model/user-model.js';
import { LogoutTokenInput, RefreshTokenInput } from '../model/token-model.js';

export class UserValidation {
    
    static readonly REGISTER: ZodType<CreateUserInput> = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(1, 'Phone is required'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
    });

    static readonly LOGIN: ZodType<LoginInput> = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        deviceId: z.string().min(1, 'Device ID is required'),
    });

    static readonly REFRESH_TOKEN: ZodType<RefreshTokenInput> = z.object({
        token: z.string().min(1, 'Token is required'),
        deviceId: z.string().min(1, 'Device ID is required'),
    });

    static readonly UPDATE_USER: ZodType<UpdateUserInput> = z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    });

    static readonly DEVICEID: ZodType<LogoutTokenInput> = z.object({
        deviceId: z.string().min(1, 'Device ID is required'),
    });
}