import type { TaskPriority, TaskStatus } from "@prisma/client";

export interface CreateTaskDto
{
    title: string;
    description?: string;
    assignedDeveloperId?: string;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface UpdateTaskDto
{
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface AssignTaskDto
{
    developerId: string | null;
}

export interface UpdateTaskStatusDto
{
    status: TaskStatus;
}

export interface TaskFilters
{
    status?: TaskStatus;
    priority?: TaskPriority;
    dueFrom?: string;
    dueTo?: string;
}