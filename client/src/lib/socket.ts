import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./axios";

export const SOCKET_EVENTS = {
    notificationNew: "notification:new",
    notificationUnreadCount: "notification:unread-count",
    activityNew: "activity:new",
    taskCreated: "task:created",
    taskUpdated: "task:updated",
    presenceUpdate: "presence:update",
} as const;

export interface PresenceUser {
    id: string;
    role: string;
    online: boolean;
}

export interface PresenceUpdatePayload {
    users: PresenceUser[];
}

export interface ProjectJoinAck {
    success: boolean;
    data?: { projectId: string };
    message?: string;
}

let socket: Socket | null = null;

const getSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    try {
        const url = new URL(apiUrl);
        return url.origin;
    } catch {
        return "http://localhost:3000";
    }
};

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(getSocketUrl(), {
            autoConnect: false,
            withCredentials: true,
            transports: ["websocket", "polling"],
            auth: (cb) => {
                const token = getAccessToken();
                cb({ token });
            },
        });
    }
    return socket;
};

export const connectSocket = (): Socket => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};
