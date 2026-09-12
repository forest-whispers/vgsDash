import type { Prisma } from "@prisma/client";
import { prisma } from "../../shared/config/prisma.js";
import { NotFoundError } from "../../shared/errors/errors.js";

import type { AuthContext } from "../auth/auth.types.js";
import type { CreateNotification, NotificationFilters } from "./notifications.types.js";

export const createNotificationService = async ( tx: Prisma.TransactionClient, data: CreateNotification) =>
{
    return tx.notification.create({
        data: {
            type: data.type,
            recipientId: data.recipientId,
            ...(data.projectId !== undefined && { projectId: data.projectId }),
            ...(data.taskId !== undefined && { taskId: data.taskId }),
            ...(data.metadata !== undefined && { metadata: data.metadata })
        },
        select: {
            id: true,
            type: true,
            recipientId: true,
            projectId: true,
            taskId: true,
            metadata: true,
            readAt: true,
            createdAt: true
        }
    });
};

export const getNotificationsService = async ( user: AuthContext, filters: NotificationFilters ) =>
{
    const limit = filters.limit || 20;
    return prisma.notification.findMany({
        where: {
            recipientId: user.userId
        },
        select: {
            id: true,
            type: true,
            projectId: true,
            taskId: true,
            metadata: true,
            readAt: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit
    });
};

export const getUnreadCountService = async (user: AuthContext) =>
{
    return prisma.notification.count({
        where: {
            recipientId: user.userId,
            readAt: null
        }
    });
};

export const markNotificationReadService = async ( user: AuthContext, notificationId: string ) =>
{
    const notification = await prisma.notification.findUnique({
        where: {
            id: notificationId
        },
        select: {
            id: true,
            recipientId: true,
            readAt: true
        }
    });
    if (!notification || notification.recipientId !== user.userId)
    {
        throw new NotFoundError("Notification not found");
    }
    if (notification.readAt !== null)
    {
        return {
            notification,
            unreadCount: await getUnreadCountService(user)
        };
    }

    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId
        },
        data: {
            readAt: new Date()
        },
        select: {
            id: true,
            readAt: true
        }
    });

    const unreadCount = await getUnreadCountService(user);
    return {
        notification: updatedNotification,
        unreadCount
    };
};

export const markAllNotificationsReadService = async (user: AuthContext) =>
{
    const result = await prisma.notification.updateMany({
        where: {
            recipientId: user.userId,
            readAt: null
        },
        data: {
            readAt: new Date()
        }
    });
    return {
        updatedCount: result.count,
        unreadCount: 0
    };
};