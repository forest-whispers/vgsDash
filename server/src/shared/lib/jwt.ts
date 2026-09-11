import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

import type { JwtPayload } from "../../modules/auth/auth.types.js";
import { constants } from "../config/constants.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/errors.js";

const isValidUserRole = (value: unknown): value is UserRole =>
{
    return Object.values(UserRole).includes(value as UserRole);
};

export const generateAccessToken=(payload: JwtPayload): string =>
{
    return jwt.sign(
    {
        role: payload.role
    },
    env.ACCESS_TOKEN_SECRET,
    {
        subject: payload.userId,
        expiresIn: constants.ACCESS_TOKEN_EXPIRY
    })
}

export const verifyAccessToken=(accessToken:string): JwtPayload =>
{
    try
    {
        const decodedPayload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
        if(typeof decodedPayload==="string" || typeof decodedPayload.sub !=="string" || !isValidUserRole(decodedPayload.role))
        {
            throw new UnauthorizedError("Invalid access token");
        }
        return {
            userId: decodedPayload.sub,
            role: decodedPayload.role
        } as JwtPayload
    }
    catch(err)
    {
        if (err instanceof UnauthorizedError) {
            throw err;
        }
        else
        {
            throw new UnauthorizedError("Invalid or expired access token");
        }
    }
}