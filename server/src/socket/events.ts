import { getIO } from "./socket.js";
import { SOCKET_EVENTS, SOCKET_ROOMS } from "./constants.js";

export const emitActivity = ( projectId: string, activity: unknown ) =>
{
    const io = getIO();

    io.to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.activityNew, activity);

    io.to(SOCKET_ROOMS.admin).emit(SOCKET_EVENTS.activityNew, activity);
};

export const emitTaskCreated = ( projectId: string, task: unknown ) =>
{
    getIO().to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.taskCreated, task);
};

export const emitTaskUpdated = ( projectId: string, task: unknown ) =>
{
    getIO().to(SOCKET_ROOMS.project(projectId)).emit(SOCKET_EVENTS.taskUpdated, task);
};

export const emitNotification = ( recipientId: string, notification: unknown ) =>
{
    getIO().to(SOCKET_ROOMS.user(recipientId)).emit(SOCKET_EVENTS.notificationNew, notification);
};

export const emitUnreadCount = ( userId: string, unreadCount: number ) =>
{
    getIO().to(SOCKET_ROOMS.user(userId)).emit(SOCKET_EVENTS.notificationUnreadCount, unreadCount);
};