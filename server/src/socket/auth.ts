import { parseCookie } from "cookie";
import type { Socket, ExtendedError } from "socket.io";

import { verifyAccessToken } from "../shared/lib/jwt.js";
import type { AuthenticatedSocket } from "./types.js";

export const socketAuth = (
    socket: Socket,
    next: (err?: ExtendedError) => void,
) => {
    try {
        console.log("socket auth requested");

        const token =
            socket.handshake.auth?.token ||
            parseCookie(socket.request.headers.cookie || "").accessToken;

        if (!token || typeof token !== "string") {
            return next(new Error("Authentication required."));
        }

        const payload = verifyAccessToken(token);

        (socket as AuthenticatedSocket).user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        next(new Error("Invalid or expired access token."));
    }
};