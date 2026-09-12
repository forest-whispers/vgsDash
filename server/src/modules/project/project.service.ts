import { ProjectStatus, UserRole } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { ConflictError, NotFoundError } from "../../shared/errors/errors.js";
import type { CreateProjectDto, UpdateProjectDto } from "./project.types.js";
import type { AuthContext } from "../auth/auth.types.js";
import { ensureProjectAccess, ensureProjectManager } from "../../shared/authorization/projectResource.js";

export const createProjectService = async ( user: AuthContext, data: CreateProjectDto ) =>
{
    if (user.role === UserRole.PROJECT_MANAGER)
    {
        data.managerId = user.userId;
    }

    if (user.role === UserRole.ADMIN)
    {
        if(data.managerId)
        {
            await ensureProjectManager(data.managerId);
        }
    }

    const client = await prisma.client.findUnique({
        where: { id: data.clientId },
        select: {
            id: true
        }
    });
    if (!client) {
        throw new NotFoundError("Client not found");
    }

    return prisma.project.create({
        data: {
            name: data.name,
            ...(data.description !== undefined && { description: data.description }),
            clientId: data.clientId,
            createdById: user.userId,
            ...(data.managerId !== undefined && { managerId: data.managerId })
        },
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
};

export const getProjectsService = async (user: AuthContext) =>
{
    return prisma.project.findMany({
        where: { ...(user.role !== UserRole.ADMIN && { managerId: user.userId }) },
        orderBy: {
            createdAt: "desc"
        },
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
};

export const getProjectService = async ( user: AuthContext, projectId: string ) =>
{
    const project = await ensureProjectAccess(user, projectId);
    return project;
};

export const updateProjectService = async ( user: AuthContext, projectId: string, data: UpdateProjectDto ) => {
    const project = await ensureProjectAccess(user, projectId);
    if (project.status === ProjectStatus.ABANDONED)
    {
        throw new ConflictError("Abandoned projects cannot be updated");
    }

    const allowedFields: (keyof UpdateProjectDto)[] = user.role === UserRole.ADMIN
            ? ["name", "description", "clientId", "managerId"]
            : ["name", "description", "clientId"];
    const filteredPayload: UpdateProjectDto = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(user.role === UserRole.ADMIN && data.managerId !== undefined && { managerId: data.managerId })
    };

    if (filteredPayload.clientId)
    {
        const client = await prisma.client.findUnique({
            where: { id: filteredPayload.clientId },
            select: {
                id: true
            }
        });
        if (!client)
        {
            throw new NotFoundError("Client not found");
        }
    }
    if (filteredPayload.managerId)
    {
        await ensureProjectManager(filteredPayload.managerId);
    }

    return prisma.project.update({
        where: { id: projectId },
        data: filteredPayload,
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
};

export const abandonProjectService = async ( user: AuthContext, projectId: string ) => {
    const project = await ensureProjectAccess(user, projectId);
    if (project.status === ProjectStatus.ABANDONED)
    {
        throw new ConflictError("Project is already abandoned");
    }
    return prisma.project.update({
        where: { id: projectId },
        data: {
            status: ProjectStatus.ABANDONED
        },
        select: {
            id: true,
            status: true
        }
    });
};