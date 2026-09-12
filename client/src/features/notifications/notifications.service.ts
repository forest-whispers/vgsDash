import api from "../../lib/axios";
import type { NotificationFilters, NotificationItem } from "./notifications.types";

export const getNotifications = async (
    filters?: NotificationFilters
): Promise<NotificationItem[]> => {
    const params: Record<string, number> = {};
    if (filters?.limit) params.limit = filters.limit;

    const response = await api.get<{ notifications: NotificationItem[] }>(
        "/notifications",
        { params }
    );
    return response.data.notifications;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await api.get<{ unreadCount: number }>(
        "/notifications/unread-count"
    );
    return response.data.unreadCount;
};

export const markNotificationRead = async (
    notificationId: string
): Promise<{ id: string; readAt: string }> => {
    const response = await api.patch<{
        notification: { id: string; readAt: string };
    }>('/notifications/' + notificationId + '/read');
    return response.data.notification;
};

export const markAllNotificationsRead = async (): Promise<{
    message: string;
    updatedCount: number;
}> => {
    const response = await api.patch<{
        message: string;
        updatedCount: number;
    }>("/notifications/read-all");
    return response.data;
};
