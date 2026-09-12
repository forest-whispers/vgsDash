import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

const allowedOrigins = [
    "http://localhost:5173",
    "https://vgs-dash.vercel.app",
    "https://vgs-dash-git-main-forest-whispers-projects.vercel.app",
    "https://vgs-dash-r8k849wtw-forest-whispers-projects.vercel.app",
];


export const createSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
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