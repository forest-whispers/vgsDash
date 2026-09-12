import { Prisma, TaskStatus, UserRole } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/errors.js";
import { ensureDeveloper, ensureTaskAccess } from "../../shared/authorization/taskResource.js";
import type { AuthContext } from "../auth/auth.types.js";
import type { AssignTaskDto, CreateTaskDto, TaskFilters, UpdateTaskDto, UpdateTaskStatusDto } from "./tasks.types.js";

export const taskStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [
        TaskStatus.IN_PROGRESS
    ],
    [TaskStatus.IN_PROGRESS]: [
        TaskStatus.TODO,
        TaskStatus.IN_REVIEW
    ],
    [TaskStatus.IN_REVIEW]: [
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE
    ],
    [TaskStatus.DONE]: [
        TaskStatus.IN_PROGRESS
    ]
};

export const createTaskService = async ( user: AuthContext, projectId: string, data: CreateTaskDto ) =>
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
    if (user.role !== UserRole.ADMIN &&project.managerId !== user.userId)
    {
        throw new ForbiddenError("You do not have access to this project");
    }
    if (data.assignedDeveloperId)
    {
        await ensureDeveloper(data.assignedDeveloperId);
    }

    return prisma.task.create({
        data: {
            title: data.title,
            ...(data.description !== undefined && { description: data.description }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
            ...(data.assignedDeveloperId !== undefined && { assignedDeveloperId: data.assignedDeveloperId }),
            projectId,
            createdById: user.userId
        },
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
            updatedAt: true
        }
    });
};

export const getTasksService = async ( user: AuthContext, projectId: string, filters: TaskFilters ) =>
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
    if (user.role === UserRole.ADMIN || user.role === UserRole.DEVELOPER)
    {} else if (user.role === UserRole.PROJECT_MANAGER)
    {
        if (project.managerId !== user.userId)
        {
            throw new ForbiddenError("You do not have access to this project");
        }
    } else
    {
        throw new ForbiddenError("You do not have access to tasks");
    }

    return prisma.task.findMany({
        where: {
            projectId,
            ...(user.role === UserRole.DEVELOPER && { assignedDeveloperId: user.userId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.priority && { priority: filters.priority }),
            ...((filters.dueFrom || filters.dueTo) && {
                dueDate: {
                    ...(filters.dueFrom && { gte: new Date(filters.dueFrom) }),
                    ...(filters.dueTo && { lte: new Date(filters.dueTo) })
                }
            })
        },
        orderBy: [
            {
                priority: "desc"
            },
            {
                dueDate: "asc"
            }
        ],
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
            updatedAt: true
        }
    });
};

export const getTaskService = async ( user: AuthContext, taskId: string ) =>
{
    const task = await ensureTaskAccess(user, taskId);
    return task;
};

export const updateTaskService = async ( user: AuthContext, taskId: string, data: UpdateTaskDto ) =>
{
    const task = await ensureTaskAccess(user, taskId);
    if (task.status === "DONE")
    {
        throw new ConflictError("Completed tasks cannot be updated");
    }

    const allowedFields: (keyof UpdateTaskDto)[] = [
        "title",
        "description",
        "priority",
        "dueDate"
    ];
    const filteredPayload: UpdateTaskDto = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate })
    };

    return prisma.task.update({
        where: { id: taskId },
        data: {
            ...filteredPayload,
            ...(filteredPayload.dueDate !== undefined && { dueDate: new Date(filteredPayload.dueDate) })
        },
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
            updatedAt: true
        }
    });
};

export const assignTaskService = async ( user: AuthContext, taskId: string, data: AssignTaskDto ) =>
{
    const task = await ensureTaskAccess(user, taskId);
    if (user.role === UserRole.DEVELOPER)
    {
        throw new ForbiddenError("Developers cannot assign tasks");
    }
    if (task.status === "DONE")
    {
        throw new ConflictError("Completed tasks cannot be reassigned");
    }

    if (data.developerId)
    {
        await ensureDeveloper(data.developerId);
    }

    return prisma.task.update({
        where: { id: taskId },
        data: {
            assignedDeveloperId: data.developerId
        },
        select: {
            id: true,
            assignedDeveloperId: true,
            updatedAt: true
        }
    });
};

export const updateTaskStatusService = async ( user: AuthContext, taskId: string, data: UpdateTaskStatusDto ) =>
{
    const task = await ensureTaskAccess(user, taskId);

    const allowedTransitions = taskStatusTransitions[task.status];
    if (!allowedTransitions.includes(data.status))
    {
        throw new ConflictError(`Task cannot move from ${task.status} to ${data.status}.`);
    }

    return prisma.task.update({
        where: { id: taskId },
        data: {
            status: data.status
        },
        select: {
            id: true,
            status: true,
            updatedAt: true
        }
    });
};