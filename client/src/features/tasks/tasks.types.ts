export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    projectId: string;
    assignedDeveloperId: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    dueFrom?: string;
    dueTo?: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assignedDeveloperId?: string | null;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string | null;
}

export interface DeveloperOption {
    id: string;
    name: string;
    email: string;
}
