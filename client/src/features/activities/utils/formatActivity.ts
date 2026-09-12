import type { Activity } from "../activities.types";

const formatStatus = (status?: string): string => {
    switch (status) {
        case "TODO":
            return "To Do";
        case "IN_PROGRESS":
            return "In Progress";
        case "IN_REVIEW":
            return "In Review";
        case "DONE":
            return "Done";
        default:
            return status || "";
    }
};

export const formatActivityAction = (activity: Activity): string => {
    const { type, metadata } = activity;

    switch (type) {
        case "PROJECT_CREATED":
            return "created this project";

        case "PROJECT_UPDATED": {
            const fields =
                Array.isArray(metadata?.fields) && metadata.fields.length > 0
                    ? ` (${metadata.fields.join(", ")})`
                    : "";
            return `updated project details${fields}`;
        }

        case "PROJECT_ABANDONED":
            return "abandoned this project";

        case "TASK_CREATED":
            return "created a new task";

        case "TASK_UPDATED": {
            const fields =
                Array.isArray(metadata?.fields) && metadata.fields.length > 0
                    ? ` (${metadata.fields.join(", ")})`
                    : "";
            return `updated task details${fields}`;
        }

        case "TASK_ASSIGNED":
            return "assigned the task to a developer";

        case "TASK_REASSIGNED":
            return "reassigned the task to a developer";

        case "TASK_UNASSIGNED":
            return "unassigned the developer from the task";

        case "TASK_STATUS_CHANGED": {
            const from = metadata?.from ? formatStatus(String(metadata.from)) : null;
            const to = metadata?.to ? formatStatus(String(metadata.to)) : null;
            if (from && to) {
                return `changed task status from "${from}" to "${to}"`;
            }
            return "changed task status";
        }

        default:
            return `performed action: ${type}`;
    }
};
