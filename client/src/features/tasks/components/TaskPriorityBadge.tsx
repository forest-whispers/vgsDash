import type { TaskPriority } from "../tasks.types";

interface TaskPriorityBadgeProps {
    priority: TaskPriority;
}

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
    switch (priority) {
        case "LOW":
            return (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Low
                </span>
            );
        case "MEDIUM":
            return (
                <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                    Medium
                </span>
            );
        case "HIGH":
            return (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    High
                </span>
            );
        case "CRITICAL":
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    Critical
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {priority}
                </span>
            );
    }
}
