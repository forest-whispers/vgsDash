import type { Task, TaskStatus } from "../tasks.types";
import Modal from "../../../shared/ui/Modal";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusControl from "./TaskStatusControl";
import Button from "../../../shared/ui/Button";

interface TaskDetailsModalProps {
    task: Task;
    onClose: () => void;
    onStatusChange?: (nextStatus: TaskStatus) => Promise<void>;
}

export default function TaskDetailsModal({
    task,
    onClose,
    onStatusChange,
}: TaskDetailsModalProps) {
    return (
        <Modal title="Task Details" onClose={onClose}>
            <div className="flex flex-col gap-4 text-sm text-gray-700">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {task.title}
                    </h3>
                </div>

                {task.description ? (
                    <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
                        {task.description}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">No description provided.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                    <div>
                        <span className="text-xs font-medium text-gray-500 block">Project</span>
                        <span className="font-medium text-gray-900">
                            {task.project?.name ?? "Project " + task.projectId}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-gray-500 block">Priority</span>
                        <div className="mt-1">
                            <TaskPriorityBadge priority={task.priority} />
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-gray-500 block">Status</span>
                        <div className="mt-1 flex items-center gap-2">
                            <TaskStatusBadge status={task.status} />
                            {onStatusChange && (
                                <TaskStatusControl
                                    status={task.status}
                                    onChange={onStatusChange}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-gray-500 block">Due Date</span>
                        <span className="text-gray-800">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  })
                                : "No due date"}
                        </span>
                    </div>
                </div>

                {task.assignedDeveloper && (
                    <div className="border-t border-gray-100 pt-3">
                        <span className="text-xs font-medium text-gray-500 block">Assigned Developer</span>
                        <span className="text-gray-800">
                            {task.assignedDeveloper.name} ({task.assignedDeveloper.email})
                        </span>
                    </div>
                )}

                <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
