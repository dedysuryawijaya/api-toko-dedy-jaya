import { z, ZodType } from 'zod';
import { CreateUserInput, LoginInput, RefreshTokenInput } from '../model/user-model.js';

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
    });

    static readonly REFRESH_TOKEN: ZodType<RefreshTokenInput> = z.object({
        token: z.string().min(1, 'Token is required'),
    });

    static readonly UPDATE_USER: ZodType = z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    });
}