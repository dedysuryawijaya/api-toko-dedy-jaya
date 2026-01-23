import { User } from "@prisma/client";

export type UserResponse = {
    id: number;
    name: string | null;
    email?: string | null;
    phone?: string | null;
    token?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateUserInput = {
    name: string;
    email: string;
    phone: string ;
    password: string;
}

export type UpdateUserInput = {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    password?: string | undefined;
}

export type LoginInput = {
    email: string;
    password: string;
    deviceId: string;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
