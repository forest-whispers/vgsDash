import type { Request, Response } from "express";

import * as notificationsService from "./notifications.service.js";

export const getNotifications = async (req: Request, res: Response) =>
{
        const notifications = await notificationsService.getNotificationsService(
            req.user!,
            req.query
        );
        res.status(200).json({ notifications });
};

export const getUnreadCount = async (req: Request, res: Response) =>
{
    const unreadCount = await notificationsService.getUnreadCountService(
        req.user!
    );
    res.status(200).json({ unreadCount });
};

export const markNotificationRead = async (req: Request, res: Response) =>
{
    const notificationId = req.params.notificationId as string;
    const notification = await notificationsService.markNotificationReadService(
        req.user!,
        notificationId
    );
    res.status(200).json({ notification });
};

export const markAllNotificationsRead = async (req: Request, res: Response) =>
{
    const result = await notificationsService.markAllNotificationsReadService(
        req.user!
    );
    res.status(200).json({
        message: "All notifications marked as read.",
        updatedCount: result.updatedCount
    });
};