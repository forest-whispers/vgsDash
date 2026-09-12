import api from "../../lib/axios";
import type {
    CreateTaskData,
    DeveloperOption,
    Task,
    TaskFilters,
    TaskStatus,
    UpdateTaskData,
} from "./tasks.types";

export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["TODO", "IN_REVIEW"],
    IN_REVIEW: ["IN_PROGRESS", "DONE"],
    DONE: ["IN_PROGRESS"],
};

export const getProjectTasks = async (
    projectId: string,
    filters?: TaskFilters
): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.dueFrom) params.dueFrom = new Date(filters.dueFrom).toISOString();
    if (filters?.dueTo) params.dueTo = new Date(filters.dueTo).toISOString();

    const response = await api.get<{ tasks: Task[] }>(
        `/projects/${projectId}/tasks`,
        { params }
    );
    return response.data.tasks;
};

export const createTask = async (
    projectId: string,
    data: CreateTaskData
): Promise<Task> => {
    const payload = {
        title: data.title,
        ...(data.description ? { description: data.description } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
        ...(data.assignedDeveloperId ? { assignedDeveloperId: data.assignedDeveloperId } : {}),
    };
    const response = await api.post<{ task: Task }>(
        `/projects/${projectId}/tasks`,
        payload
    );
    return response.data.task;
};

export const updateTask = async (
    taskId: string,
    data: UpdateTaskData
): Promise<Task> => {
    const payload = {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.dueDate !== undefined
            ? { dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null }
            : {}),
    };
    const response = await api.patch<{ task: Task }>(`/tasks/${taskId}`, payload);
    return response.data.task;
};

export const assignTask = async (
    taskId: string,
    developerId: string | null
): Promise<{ id: string; assignedDeveloperId: string | null; updatedAt: string }> => {
    const response = await api.patch<{
        task: { id: string; assignedDeveloperId: string | null; updatedAt: string };
    }>(`/tasks/${taskId}/assign`, {
        developerId,
    });
    return response.data.task;
};

export const updateTaskStatus = async (
    taskId: string,
    status: TaskStatus
): Promise<{ id: string; status: TaskStatus; updatedAt: string }> => {
    const response = await api.patch<{
        task: { id: string; status: TaskStatus; updatedAt: string };
    }>(`/tasks/${taskId}/status`, {
        status,
    });
    return response.data.task;
};

export const getDevelopers = async (): Promise<DeveloperOption[]> => {
    const response = await api.get<{ users: DeveloperOption[] }>("/users", {
        params: { role: "DEVELOPER" },
    });
    return response.data.users;
};

export const getMyTasks = async (filters?: TaskFilters): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.dueFrom) params.dueFrom = new Date(filters.dueFrom).toISOString();
    if (filters?.dueTo) params.dueTo = new Date(filters.dueTo).toISOString();

    const response = await api.get<{ tasks: Task[] }>("/tasks", { params });
    return response.data.tasks;
};

export const getTaskDetails = async (taskId: string): Promise<Task> => {
    const response = await api.get<{ task: Task }>(`/tasks/${taskId}`);
    return response.data.task;
};

const PRIORITY_RANK: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
};

export const sortDeveloperTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
        const pA = PRIORITY_RANK[a.priority] ?? 0;
        const pB = PRIORITY_RANK[b.priority] ?? 0;
        if (pA !== pB) {
            return pB - pA;
        }
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) {
            return -1;
        }
        if (!a.dueDate && b.dueDate) {
            return 1;
        }
        return 0;
    });
};
