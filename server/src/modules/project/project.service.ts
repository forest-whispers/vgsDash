import { ActivityType, NotificationType, ProjectStatus, UserRole } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { ConflictError, NotFoundError } from "../../shared/errors/errors.js";
import type { CreateProjectDto, UpdateProjectDto } from "./project.types.js";
import type { AuthContext } from "../auth/auth.types.js";
import { ensureProjectAccess, ensureProjectManager } from "../../shared/authorization/projectResource.js";
import { createActivityService } from "../activities/activities.service.js";
import { createNotificationService } from "../notifications/notifications.service.js";
import { emitActivity, emitNotification } from "../../socket/events.js";

export const createProjectService = async ( user: AuthContext, data: CreateProjectDto ) =>
{
    let managerId = data.managerId;
    if (user.role === UserRole.PROJECT_MANAGER)
    {
        managerId = user.userId;
    }

    if (user.role === UserRole.ADMIN)
    {
        if(managerId)
        {
            await ensureProjectManager(managerId);
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

    const result = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name: data.name,
                ...(data.description !== undefined && { description: data.description }),
                clientId: data.clientId,
                createdById: user.userId,
                ...(managerId !== undefined && { managerId })
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

        const activity = await createActivityService(tx, {
            type: ActivityType.PROJECT_CREATED,
            actorId: user.userId,
            projectId: project.id
        });

        let notification = null;
        if (managerId !== undefined && managerId !== null && managerId !== user.userId)
        {
            notification = await createNotificationService(tx, {
                type: NotificationType.PROJECT_ASSIGNED,
                recipientId: managerId,
                projectId: project.id,
                metadata: {
                    projectName: project.name
                }
            });
        }
        return {
            project,
            activity,
            notification
        }
    });

    emitActivity( result.project.id, result.activity);
    if (result.notification)
    {
        emitNotification( result.notification.recipientId, result.notification);
    }
    return result.project;
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

    // allowedFields: ["name", "description", "clientId", "managerId"] || ["name", "description", "clientId"]
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

    const result = await prisma.$transaction(async (tx) => {
        const updatedProject = await tx.project.update({
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

        const activity = await createActivityService(tx, {
            type: ActivityType.PROJECT_UPDATED,
            actorId: user.userId,
            projectId: updatedProject.id,
            metadata: {
                fields: Object.keys(filteredPayload)
            }
        });

        let notification = null;
        if (project.managerId !== updatedProject.managerId && updatedProject.managerId !== null && updatedProject.managerId !== user.userId)
        {
            notification = await createNotificationService(tx, {
                type: NotificationType.PROJECT_ASSIGNED,
                recipientId: updatedProject.managerId,
                projectId: updatedProject.id,
                metadata: {
                    projectName: updatedProject.name,
                },
            });
        }
        return {
            project: updatedProject,
            activity,
            notification
        };
    });

    emitActivity( result.project.id, result.activity);
    if (result.notification)
    {
        emitNotification( result.notification.recipientId, result.notification);
    }
    return result.project;
};

export const abandonProjectService = async ( user: AuthContext, projectId: string ) => {
    const project = await ensureProjectAccess(user, projectId);
    if (project.status === ProjectStatus.ABANDONED)
    {
        throw new ConflictError("Project is already abandoned");
    }
    const result = await prisma.$transaction(async (tx) => {
        const updatedProject = await tx.project.update({
            where: { id: projectId },
            data: {
                status: ProjectStatus.ABANDONED
            },
            select: {
                id: true,
                status: true,
                updatedAt: true
            }
        });

        const activity =await createActivityService(tx, {
            type: ActivityType.PROJECT_ABANDONED,
            actorId: user.userId,
            projectId: projectId
        });

        return {
            project: updatedProject,
            activity
        };
    });

    emitActivity( projectId, result.activity);
    return result.project;
};