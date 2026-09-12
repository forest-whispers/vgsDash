import type { TaskStatus } from "../tasks.types";

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
    switch (status) {
        case "TODO":
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    To Do
                </span>
            );
        case "IN_PROGRESS":
            return (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    In Progress
                </span>
            );
        case "IN_REVIEW":
            return (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    In Review
                </span>
            );
        case "DONE":
            return (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Done
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {status}
                </span>
            );
    }
}
