export type NotificationType =
    | "PROJECT_ASSIGNED"
    | "TASK_ASSIGNED"
    | "TASK_IN_REVIEW";

export interface NotificationMetadata {
    taskTitle?: string;
    projectName?: string;
    [key: string]: unknown;
}

export interface NotificationItem {
    id: string;
    type: NotificationType;
    projectId: string | null;
    taskId: string | null;
    metadata: NotificationMetadata | null;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationFilters {
    limit?: number;
}
