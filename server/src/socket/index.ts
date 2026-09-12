import type { Server as HttpServer } from "http";

import { createSocket } from "./socket.js";
import { socketAuth } from "./auth.js";
import type { AuthenticatedSocket } from "./types.js";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "./constants.js";
import { UserRole } from "@prisma/client";
import { ensureSocketProjectAccess } from "../modules/project/realtime/project.realtime.accessHelper.js";
import { addSocketToProject, getProjectPresence, removeSocketFromProject } from "../modules/project/realtime/project.realtime.presence.js";
import { getUnreadCountService } from "../modules/notifications/notifications.service.js";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = createSocket(httpServer);

    io.use(socketAuth);

    io.on("connection", (socket) =>
    {
        const client = socket as AuthenticatedSocket;
        const { userId, role } = client.user;

        client.join(SOCKET_ROOMS.user(userId));
        if (role === UserRole.ADMIN)
        {
            client.join(SOCKET_ROOMS.admin);
        }
        console.log(`Socket connected: ${userId}`);

        client.on("project:join", async (
                projectId: string,
                callback: (response: {
                    success: boolean;
                    data?: { projectId: string };
                    message?: string;
                }) => void
            ) =>
            {
                try
                {
                    console.log("project:join requested");
                    await ensureSocketProjectAccess(client.user, projectId);

                    await client.join(SOCKET_ROOMS.project(projectId));
                    console.log(`project:join: ${projectId}`);

                    const unreadCount = await getUnreadCountService(client.user);

                    client.emit(SOCKET_EVENTS.notificationUnreadCount, unreadCount);

                    const presence = getProjectPresence(projectId);

                    const cameBackOnline = addSocketToProject( projectId, client.user.userId, client.user.role, client.id);

                    client.emit(SOCKET_EVENTS.presenceUpdate,
                        {
                            users: presence.map((user) => ({
                                ...user,
                                online: true
                            }))
                        }
                    );

                    if (cameBackOnline)
                    {
                        io.to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.presenceUpdate,
                            {
                                users: [
                                    {
                                        id: client.user.userId,
                                        role: client.user.role,
                                        online: true,
                                    },
                                ],
                            },
                        );
                    }

                    console.log(`project:join: ${projectId}`);
                    callback({
                        success: true,
                        data: {
                            projectId
                        }
                    });
                } catch (error)
                {
                    callback({
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Something went wrong"
                    });
                }
            },
        );

        client.on("project:leave", async (
                projectId: string,
                callback: (response: {
                    success: boolean;
                    data?: { projectId: string };
                    message?: string;
                }) => void
            ) => {
                try
                {
                    console.log("project:leave requested");

                    const wentOffline = removeSocketFromProject( projectId, client.user.userId, client.id);

                    await client.leave(SOCKET_ROOMS.project(projectId));

                    if (wentOffline)
                    {
                        io.to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.presenceUpdate,
                            {
                                users: [
                                    {
                                        id: client.user.userId,
                                        role: client.user.role,
                                        online: false,
                                    },
                                ],
                            },
                        );
                    }

                    console.log(`project:leave: ${projectId}`);
                    callback({
                        success: true,
                        data: {
                            projectId
                        }
                    });
                } catch (error) {
                    callback({
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Something went wrong"
                    });
                }
            },
        );

        client.on("disconnecting", () => {
            console.log(`Socket disconnecting: ${userId}`);

            for (const room of client.rooms)
            {
                if (!room.startsWith("project:"))
                {
                    continue;
                }
                const projectId = room.replace("project:", "");

                const wentOffline = removeSocketFromProject( projectId, client.user.userId, client.id);
                if (!wentOffline)
                {
                    continue;
                }

                client.to(room).emit(SOCKET_EVENTS.presenceUpdate,
                    {
                        users: [
                            {
                                id: client.user.userId,
                                role: client.user.role,
                                online: false,
                            },
                        ],
                    },
                );
            }
        });
    });

    return io;
};