import type { TaskFilters, TaskPriority, TaskStatus } from "../tasks.types";
import Button from "../../../shared/ui/Button";

interface TaskFiltersBarProps {
    filters: TaskFilters;
    onChange: (filters: TaskFilters) => void;
    onReset: () => void;
}

export default function TaskFiltersBar({
    filters,
    onChange,
    onReset,
}: TaskFiltersBarProps) {
    const hasActiveFilters = Boolean(
        filters.status || filters.priority || filters.dueFrom || filters.dueTo
    );

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Status:</label>
                <select
                    value={filters.status || ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            status: (e.target.value as TaskStatus) || undefined,
                        })
                    }
                    className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Priority:</label>
                <select
                    value={filters.priority || ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            priority: (e.target.value as TaskPriority) || undefined,
                        })
                    }
                    className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Due From:</label>
                <input
                    type="date"
                    value={filters.dueFrom || ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            dueFrom: e.target.value || undefined,
                        })
                    }
                    className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Due To:</label>
                <input
                    type="date"
                    value={filters.dueTo || ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            dueTo: e.target.value || undefined,
                        })
                    }
                    className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {hasActiveFilters && (
                <Button
                    variant="secondary"
                    onClick={onReset}
                    className="text-xs py-1 px-2.5 ml-auto"
                >
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
