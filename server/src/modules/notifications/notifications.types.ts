import type { NotificationType, Prisma } from "@prisma/client";

export interface CreateNotification
{
    type: NotificationType;
    recipientId: string;
    projectId?: string;
    taskId?: string;
    metadata?: Prisma.InputJsonValue;
}

export interface NotificationResponse
{
    id: string;
    type: NotificationType;
    projectId: string | null;
    taskId: string | null;
    metadata: unknown;
    readAt: Date | null;
    createdAt: Date;
}

export interface NotificationFilters {
    limit?: number;
}