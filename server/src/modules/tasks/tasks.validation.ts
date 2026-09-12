import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(2000).optional(),
    priority: z.enum(TaskPriority).optional(),
    dueDate: z.string().datetime().optional(),
    assignedDeveloperId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    priority: z.enum(TaskPriority).optional(),
    dueDate: z.string().datetime().optional(),
});

export const assignTaskSchema = z.object({
    developerId: z.string().min(1).nullable(),
});

export const updateTaskStatusSchema = z.object({
    status: z.enum(TaskStatus),
});

export const taskFiltersSchema = z.object({
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(TaskPriority).optional(),
    dueFrom: z.string().datetime().optional(),
    dueTo: z.string().datetime().optional(),
});