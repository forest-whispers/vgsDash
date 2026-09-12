export const SOCKET_ROOMS = {
    user: (userId: string) => `user:${userId}`,
    admin: "admin",
    project: (projectId: string) => `project:${projectId}`
} as const;

export const SOCKET_EVENTS = {
    notificationNew: "notification:new",
    notificationUnreadCount: "notification:unread-count",
    activityNew: "activity:new",
    taskCreated: "task:created",
    taskUpdated: "task:updated",
    presenceUpdate: "presence:update"
} as const;