import { UserRole } from "@prisma/client";

import { prisma } from "../../../shared/config/prisma.js";
import { ForbiddenError, NotFoundError } from "../../../shared/errors/errors.js";
import type { AuthContext } from "../../auth/auth.types.js";

export const ensureSocketProjectAccess = async ( user: AuthContext, projectId: string) =>
{
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            id: true,
            managerId: true
        }
    });
    if (!project)
    {
        throw new NotFoundError("Project not found");
    }
    
    if (user.role === UserRole.ADMIN)
    {
        return project;
    }
    if (user.role === UserRole.PROJECT_MANAGER)
    {
        if (project.managerId === user.userId)
        {
            return project;
        }
        throw new ForbiddenError("You do not have access to this project");
    }
    if (user.role === UserRole.DEVELOPER)
    {
        const isDeveloperCollaborated = await prisma.task.findFirst({
            where: {
                projectId,
                assignedDeveloperId: user.userId,
            },
            select: {
                id: true,
            },
        });
        if (!isDeveloperCollaborated) {
            throw new ForbiddenError("You do not have access to this project");
        }
        return project;
    }
    return;
};