import { Token } from "@prisma/client";
import moment from "moment";

export type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export type CreateTokenInput = {
    userId: number;
    token: string;
}

export function toTokenResponse(token: Token, accessToken: string): TokenResponse {
    return {
        accessToken: accessToken,
        refreshToken: token.token,
        expiresIn: moment.now() + 24 * 60 * 60 * 1000,
    };
}