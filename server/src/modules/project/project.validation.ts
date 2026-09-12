import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(1000).optional(),
    clientId: z.string().min(1),
    managerId: z.string().min(1).optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(1000).optional(),
    clientId: z.string().min(1).optional(),
    managerId: z.string().min(1).nullable().optional(),
});

export const projectStatusSchema = z.object({
    status: z.enum(ProjectStatus),
});