import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import * as tasksService from "../tasks.service";
import type { Task, TaskFilters, TaskStatus } from "../tasks.types";
import TaskStatusBadge from "../components/TaskStatusBadge";
import TaskPriorityBadge from "../components/TaskPriorityBadge";
import TaskStatusControl from "../components/TaskStatusControl";
import TaskFiltersBar from "../components/TaskFiltersBar";
import TaskDetailsModal from "../components/TaskDetailsModal";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function DeveloperTasksPage() {
    const { user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [filters, setFilters] = useState<TaskFilters>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetchTasks = useCallback(() => {
        setRefreshIndex((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;
        tasksService
            .getMyTasks(filters)
            .then((data) => {
                if (!isMounted) return;
                const sorted = tasksService.sortDeveloperTasks(data);
                setTasks(sorted);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(getErrorMessage(err, "Failed to load assigned tasks"));
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [filters, refreshIndex]);

    const handleStatusChange = async (taskId: string, nextStatus: TaskStatus) => {
        setActionError(null);
        try {
            const updated = await tasksService.updateTaskStatus(taskId, nextStatus);
            setTasks((prev) => {
                const mapped = prev.map((t) =>
                    t.id === taskId ? { ...t, status: updated.status } : t
                );
                return tasksService.sortDeveloperTasks(mapped);
            });
            setSelectedTask((prev) =>
                prev && prev.id === taskId ? { ...prev, status: updated.status } : prev
            );
        } catch (err) {
            const errMsg = getErrorMessage(err, "Failed to update task status");
            setActionError(errMsg);
            throw err;
        }
    };

    // Route access guard: intended specifically for DEVELOPER users
    if (user && user.role !== "DEVELOPER") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and update tasks assigned to you across all projects.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        {tasks.length} Assigned {tasks.length === 1 ? "Task" : "Tasks"}
                    </span>
                </div>
            </div>

            {/* Filters Bar */}
            <TaskFiltersBar
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({})}
            />

            {/* Action Error Banner */}
            {actionError && (
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span>{actionError}</span>
                    <button
                        onClick={() => setActionError(null)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 ml-2"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Content Area */}
            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
                    <Spinner />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-semibold">{error}</p>
                    <Button
                        variant="secondary"
                        onClick={refetchTasks}
                        className="mt-3 text-xs"
                    >
                        Try Again
                    </Button>
                </div>
            ) : tasks.length === 0 ? (
                <EmptyState
                    title="No tasks assigned"
                    message="You do not have any tasks matching your filters right now."
                />
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Task</th>
                                <th className="px-4 py-3">Project</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.map((task) => (
                                <tr
                                    key={task.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 max-w-[280px]">
                                        <div className="font-medium text-gray-900 truncate">
                                            {task.title}
                                        </div>
                                        {task.description && (
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                {task.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="font-medium text-gray-800">
                                            {task.project?.name ?? "Project " + task.projectId.slice(0, 8)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <TaskPriorityBadge priority={task.priority} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <TaskStatusBadge status={task.status} />
                                            <TaskStatusControl
                                                status={task.status}
                                                onChange={(next) =>
                                                    handleStatusChange(task.id, next)
                                                }
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                        {task.dueDate
                                            ? new Date(task.dueDate).toLocaleDateString(
                                                  undefined,
                                                  {
                                                      year: "numeric",
                                                      month: "short",
                                                      day: "numeric",
                                                  }
                                              )
                                            : "�"}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setSelectedTask(task)}
                                            className="text-xs py-1 px-2.5"
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onStatusChange={(next) =>
                        handleStatusChange(selectedTask.id, next)
                    }
                />
            )}
        </div>
    );
}
