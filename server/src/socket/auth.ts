import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";
import type { Socket, ExtendedError } from "socket.io";

import { env } from "../shared/config/env.js";
import type { AuthContext } from "../modules/auth/auth.types.js";
import type { AuthenticatedSocket } from "./types.js";

interface SocketPayload
{
    userId: string;
    role: AuthContext["role"];
}

export const socketAuth = (
    socket: Socket,
    next: (err?: ExtendedError) => void,
) => {
    try {
        console.log("socket auth requested")
        
        // const token = socket.handshake.auth?.token;
        const cookies = socket.request.headers.cookie || "";
        const parsed = parseCookie(cookies);
        const token = parsed.accessToken;

        if (!token || typeof token !== "string") {
            return next(new Error("Authentication required."));
        }

        const payload = jwt.verify(
            token,
            env.ACCESS_TOKEN_SECRET,
        ) as SocketPayload;

        if (!payload.userId || !payload.role) {
            return next(new Error("Invalid access token."));
        }

        (socket as AuthenticatedSocket).user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        next(new Error("Invalid or expired access token."));
    }
};