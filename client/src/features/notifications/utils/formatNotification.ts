import type { NotificationItem } from "../notifications.types";

export const formatNotificationMessage = (
    notification: NotificationItem
): string => {
    const { type, metadata } = notification;

    switch (type) {
        case "PROJECT_ASSIGNED":
            return metadata?.projectName
                ? 'You were assigned as project manager for "' + metadata.projectName + '".'
                : "You were assigned to a project.";

        case "TASK_ASSIGNED":
            return metadata?.taskTitle
                ? 'You were assigned to task "' + metadata.taskTitle + '".'
                : "You were assigned to a new task.";

        case "TASK_IN_REVIEW":
            return metadata?.taskTitle
                ? 'Task "' + metadata.taskTitle + '" is ready for review.'
                : "A task was submitted for review.";

        case "TASK_OVERDUE":
            return metadata?.taskTitle
                ? 'Task "' + metadata.taskTitle + '" is overdue.'
                : "A task is overdue.";

        default:
            return "New notification: " + type;
    }
};
