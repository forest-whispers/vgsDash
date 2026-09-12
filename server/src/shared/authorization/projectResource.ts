import { UserRole } from "@prisma/client";

import { ForbiddenError, NotFoundError } from "../errors/errors.js";
import { prisma } from "../config/prisma.js";
import type { AuthContext } from "../../modules/auth/auth.types.js";

export const ensureProjectManager = async (managerId: string) =>
{
    const projectManager = await prisma.user.findUnique({
        where: { id: managerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
    if (!projectManager)
    {
        throw new NotFoundError("Project manager not found");
    }
    if (projectManager.role !== UserRole.PROJECT_MANAGER)
    {
        throw new ForbiddenError("Selected user is not a project manager");
    }
    return projectManager;
};

export const ensureProjectAccess = async ( user: AuthContext, projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            clientId: true,
            createdById: true,
            managerId: true,
            createdAt: true,
            updatedAt: true
        }
    });
    if (!project)
    {
        throw new NotFoundError("Project not found");
    }
    if (user.role !== UserRole.ADMIN && project.managerId !== user.userId)
    {
        throw new ForbiddenError("You do not have access to this project");
    }
    return project;
};