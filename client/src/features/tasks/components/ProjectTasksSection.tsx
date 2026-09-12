import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import * as tasksService from "../tasks.service";
import type {
    DeveloperOption,
    Task,
    TaskFilters,
    TaskStatus,
} from "../tasks.types";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusControl from "./TaskStatusControl";
import DeveloperAssignControl from "./DeveloperAssignControl";
import TaskFiltersBar from "./TaskFiltersBar";
import TaskModal from "./TaskModal";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";
import { getSocket, SOCKET_EVENTS } from "../../../lib/socket";

interface ProjectTasksSectionProps {
    projectId: string;
    isAbandoned: boolean;
}

export default function ProjectTasksSection({
    projectId,
    isAbandoned,
}: ProjectTasksSectionProps) {
    const { user } = useAuth();
    const canManageTasks =
        user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

    const [tasks, setTasks] = useState<Task[]>([]);
    const [developers, setDevelopers] = useState<DeveloperOption[]>([]);
    const [filters, setFilters] = useState<TaskFilters>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Fetch developers for assignment
    useEffect(() => {
        if (!canManageTasks) return;
        let isMounted = true;
        tasksService
            .getDevelopers()
            .then((devs) => {
                if (isMounted) setDevelopers(devs);
            })
            .catch(() => {
                // Non-critical, ignore
            });
        return () => {
            isMounted = false;
        };
    }, [canManageTasks]);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetchTasks = useCallback(() => {
        setRefreshIndex((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;
        tasksService
            .getProjectTasks(projectId, filters)
            .then((data) => {
                if (!isMounted) return;
                setTasks(data);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(getErrorMessage(err, "Failed to load tasks"));
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [projectId, filters, refreshIndex]);

    // Realtime task updates for the current project
    useEffect(() => {
        const socket = getSocket();

        const handleTaskCreated = (newTask: Task) => {
            if (newTask.projectId !== projectId) return;
            setTasks((prev) => {
                if (prev.some((t) => t.id === newTask.id)) {
                    return prev;
                }
                return [newTask, ...prev];
            });
        };

        const handleTaskUpdated = (updatedTask: Task) => {
            if (updatedTask.projectId !== projectId) return;
            setTasks((prev) =>
                prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
            );
        };

        socket.on(SOCKET_EVENTS.taskCreated, handleTaskCreated);
        socket.on(SOCKET_EVENTS.taskUpdated, handleTaskUpdated);

        return () => {
            socket.off(SOCKET_EVENTS.taskCreated, handleTaskCreated);
            socket.off(SOCKET_EVENTS.taskUpdated, handleTaskUpdated);
        };
    }, [projectId]);

    const handleCreateClick = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        refetchTasks();
    };

    const handleStatusChange = async (taskId: string, nextStatus: TaskStatus) => {
        setActionError(null);
        try {
            const updated = await tasksService.updateTaskStatus(taskId, nextStatus);
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId ? { ...t, status: updated.status } : t
                )
            );
        } catch (err) {
            setActionError(getErrorMessage(err, "Failed to update task status"));
            throw err;
        }
    };

    const handleAssignDeveloper = async (
        taskId: string,
        developerId: string | null
    ) => {
        setActionError(null);
        try {
            await tasksService.assignTask(taskId, developerId);
            refetchTasks();
        } catch (err) {
            setActionError(getErrorMessage(err, "Failed to assign developer"));
            throw err;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                        {tasks.length}
                    </span>
                </div>

                {canManageTasks && !isAbandoned && (
                    <Button onClick={handleCreateClick} className="text-sm">
                        + Create Task
                    </Button>
                )}
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

            {/* Task Content Area */}
            {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
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
                    title="No tasks found"
                    message={
                        canManageTasks && !isAbandoned
                            ? "Get started by creating your first task for this project."
                            : "There are currently no tasks matching the criteria."
                    }
                />
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Task</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Due Date</th>
                                {canManageTasks && !isAbandoned && (
                                    <th className="px-4 py-3 text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.map((task) => {
                                const canChangeStatus =
                                    !isAbandoned &&
                                    (canManageTasks ||
                                        (user?.role === "DEVELOPER" &&
                                            task.assignedDeveloperId === user.id));

                                return (
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
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <TaskStatusBadge status={task.status} />
                                                {canChangeStatus && (
                                                    <TaskStatusControl
                                                        status={task.status}
                                                        onChange={(next) =>
                                                            handleStatusChange(task.id, next)
                                                        }
                                                        disabled={isAbandoned}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <TaskPriorityBadge priority={task.priority} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <DeveloperAssignControl
                                                assignedDeveloperId={task.assignedDeveloperId}
                                                developers={developers}
                                                onAssign={(devId) =>
                                                    handleAssignDeveloper(task.id, devId)
                                                }
                                                canManage={canManageTasks && !isAbandoned}
                                                disabled={isAbandoned}
                                            />
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
                                                : "—"}
                                        </td>
                                        {canManageTasks && !isAbandoned && (
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleEditClick(task)}
                                                    className="text-xs py-1 px-2.5"
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Task Modal */}
            {isModalOpen && (
                <TaskModal
                    projectId={projectId}
                    task={editingTask}
                    developers={developers}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
}
