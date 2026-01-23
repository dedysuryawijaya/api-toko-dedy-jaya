import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions["expiresIn"];

export interface JwtPayload {
    userId: number;
    email: string;
}

export function signJwt(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN! });
}

export function verifyJwt(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (e) {
        return null;
    }
}