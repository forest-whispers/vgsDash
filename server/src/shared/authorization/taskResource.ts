import { UserRole } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { ForbiddenError, NotFoundError } from "../errors/errors.js";
import type { AuthContext } from "../../modules/auth/auth.types.js";

export const ensureDeveloper = async (developerId: string) =>
{
    const developer = await prisma.user.findUnique({
        where: { id: developerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
    if (!developer)
    {
        throw new NotFoundError("Developer not found");
    }
    if (developer.role !== UserRole.DEVELOPER)
    {
        throw new ForbiddenError("Selected user is not a developer");
    }
    return developer;
};

export const ensureTaskAccess = async ( user: AuthContext, taskId: string ) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            projectId: true,
            assignedDeveloperId: true,
            createdById: true,
            createdAt: true,
            updatedAt: true,
            project: {
                select: {
                    managerId: true
                }
            }
        }
    });
    if (!task)
    {
        throw new NotFoundError("Task not found");
    }
    if (user.role === UserRole.ADMIN)
    {
        return task;
    }
    if (user.role === UserRole.PROJECT_MANAGER && task.project.managerId === user.userId)
    {
        return task;
    }
    if (user.role === UserRole.DEVELOPER && task.assignedDeveloperId === user.userId)
    {
        return task;
    }
    throw new ForbiddenError("You do not have access to this task");
};