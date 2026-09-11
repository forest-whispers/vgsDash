import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../errors/errors.js";
import { verifyAccessToken } from "../lib/jwt.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) =>
{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer "))
    {
        throw new UnauthorizedError("Missing or invalid Authorization header.");
    }
    const token = authHeader.split(" ")[1];
    if(!token)
    {
        throw new UnauthorizedError("Missing or invalid access token.");
    }
    try
    {
        const decodedPayload = verifyAccessToken(token);
        req.user = {
            userId: decodedPayload.userId,
            role: decodedPayload.role
        };
        next();
    } catch (error)
 {
        next(error);
    }
}