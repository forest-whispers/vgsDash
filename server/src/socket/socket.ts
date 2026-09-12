import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { env } from "../shared/config/env.js";

let io: Server;

export const createSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            credentials: true,
        },
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }
    return io;
};