import type { Server as HttpServer } from "http";

import { createSocket } from "./socket.js";
import { socketAuth } from "./auth.js";
import type { AuthenticatedSocket } from "./types.js";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = createSocket(httpServer);

    io.use(socketAuth);

    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;

        console.log(`Socket connected: ${client.user.userId}`);

        client.on("disconnect", () => {
            console.log(`Socket disconnected: ${client.user.userId}`);
        });
    });

    return io;
};