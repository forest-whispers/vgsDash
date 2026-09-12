import { useState } from "react";
import { TASK_STATUS_TRANSITIONS } from "../tasks.service";
import type { TaskStatus } from "../tasks.types";

interface TaskStatusControlProps {
    status: TaskStatus;
    onChange: (nextStatus: TaskStatus) => Promise<void>;
    disabled?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
};

export default function TaskStatusControl({
    status,
    onChange,
    disabled = false,
}: TaskStatusControlProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const allowedNext = TASK_STATUS_TRANSITIONS[status] || [];

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextStatus = e.target.value as TaskStatus;
        if (!nextStatus || nextStatus === status) return;

        setIsUpdating(true);
        try {
            await onChange(nextStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    if (allowedNext.length === 0 || disabled) {
        return (
            <span className="text-xs font-medium text-gray-700">
                {STATUS_LABELS[status]}
            </span>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5">
            <select
                value={status}
                onChange={handleChange}
                disabled={isUpdating || disabled}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 shadow-2xs hover:bg-gray-50 focus:border-blue-500 focus:outline-none disabled:opacity-60 cursor-pointer"
            >
                <option value={status} disabled>
                    {STATUS_LABELS[status]} (Current)
                </option>
                {allowedNext.map((next) => (
                    <option key={next} value={next}>
                        &rarr; {STATUS_LABELS[next]}
                    </option>
                ))}
            </select>
            {isUpdating && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            )}
        </div>
    );
}
