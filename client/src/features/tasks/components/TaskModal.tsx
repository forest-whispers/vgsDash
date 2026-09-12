import { useState } from "react";
import * as tasksService from "../tasks.service";
import type {
    CreateTaskData,
    DeveloperOption,
    Task,
    TaskPriority,
    UpdateTaskData,
} from "../tasks.types";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import Select from "../../../shared/ui/Select";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

interface TaskModalProps {
    projectId: string;
    task?: Task | null;
    developers: DeveloperOption[];
    onClose: () => void;
    onSuccess: (savedTask: Task) => void;
}

const PRIORITY_OPTIONS = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Critical", value: "CRITICAL" },
];

export default function TaskModal({
    projectId,
    task,
    developers,
    onClose,
    onSuccess,
}: TaskModalProps) {
    const isEditMode = Boolean(task);

    const [title, setTitle] = useState(task?.title ?? "");
    const [description, setDescription] = useState(task?.description ?? "");
    const [priority, setPriority] = useState<TaskPriority>(
        task?.priority ?? "MEDIUM"
    );
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? task.dueDate.slice(0, 10) : ""
    );
    const [assignedDeveloperId, setAssignedDeveloperId] = useState(
        task?.assignedDeveloperId ?? ""
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode && task) {
                const updatePayload: UpdateTaskData = {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    dueDate: dueDate ? dueDate : undefined,
                };
                let updatedTask = await tasksService.updateTask(
                    task.id,
                    updatePayload
                );

                // If developer assignment changed in edit mode
                const originalDevId = task.assignedDeveloperId ?? "";
                const newDevId = assignedDeveloperId || null;
                if (originalDevId !== (assignedDeveloperId || "")) {
                    await tasksService.assignTask(task.id, newDevId);
                    updatedTask = {
                        ...updatedTask,
                        assignedDeveloperId: newDevId,
                    };
                }

                onSuccess(updatedTask);
            } else {
                const createPayload: CreateTaskData = {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    priority,
                    dueDate: dueDate ? dueDate : undefined,
                    assignedDeveloperId: assignedDeveloperId || undefined,
                };
                const createdTask = await tasksService.createTask(
                    projectId,
                    createPayload
                );
                onSuccess(createdTask);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save task"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const developerOptions = [
        { label: "Unassigned", value: "" },
        ...developers.map((d) => ({
            label: `${d.name} (${d.email})`,
            value: d.id,
        })),
    ];

    return (
        <Modal
            title={isEditMode ? "Edit Task" : "Create Task"}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <Input
                    label="Task Title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Implement user authentication"
                    required
                    minLength={2}
                    maxLength={200}
                    disabled={isSubmitting}
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional task details or acceptance criteria..."
                        rows={3}
                        maxLength={2000}
                        disabled={isSubmitting}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label="Priority"
                        options={PRIORITY_OPTIONS}
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value as TaskPriority)
                        }
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <Select
                    label="Assign Developer"
                    options={developerOptions}
                    value={assignedDeveloperId}
                    onChange={(e) => setAssignedDeveloperId(e.target.value)}
                    disabled={isSubmitting}
                />

                <div className="mt-2 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? isEditMode
                                ? "Saving..."
                                : "Creating..."
                            : isEditMode
                            ? "Save Changes"
                            : "Create Task"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
