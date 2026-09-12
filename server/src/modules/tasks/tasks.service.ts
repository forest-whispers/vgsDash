import { ActivityType, NotificationType, Prisma, ProjectStatus, TaskStatus, UserRole } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/errors.js";
import { ensureDeveloper, ensureTaskAccess } from "../../shared/authorization/taskResource.js";
import type { AuthContext } from "../auth/auth.types.js";
import type { AssignTaskDto, CreateTaskDto, TaskFilters, UpdateTaskDto, UpdateTaskStatusDto } from "./tasks.types.js";
import { createActivityService } from "../activities/activities.service.js";
import { createNotificationService } from "../notifications/notifications.service.js";
import { emitActivity, emitNotification, emitTaskCreated, emitTaskUpdated } from "../../socket/events.js";

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
            managerId: true,
            status: true
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
    if (project.status === ProjectStatus.ABANDONED)
    {
        throw new ConflictError("Tasks cannot be created in abandoned projects");
    }

    const result = await prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
            data: {
                title: data.title,
                ...(data.description !== undefined && { description: data.description }),
                ...(data.priority !== undefined && { priority: data.priority }),
                ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
                ...(data.assignedDeveloperId !== undefined && {
                    assignedDeveloperId: data.assignedDeveloperId
                }),
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

        const activity = await createActivityService(tx, {
            type: ActivityType.TASK_CREATED,
            actorId: user.userId,
            projectId,
            taskId: task.id
        });

        let notification = null;
        if (task.assignedDeveloperId !== null)
        {
            notification = await createNotificationService(tx, {
                type: NotificationType.TASK_ASSIGNED,
                recipientId: task.assignedDeveloperId,
                projectId: task.projectId,
                taskId: task.id,
                metadata: {
                    taskTitle: task.title
                }
            });
        }
        return {
            task,
            activity,
            notification
        };
    });

    emitTaskCreated( result.task.projectId, result.task);
    emitActivity( result.task.projectId, result.activity);
    if (result.notification)
    {
        emitNotification( result.notification.recipientId, result.notification);
    }
    return result.task;
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
    const { project: _project, ...task } = await ensureTaskAccess(user, taskId);
    return task;
};

export const updateTaskService = async ( user: AuthContext, taskId: string, data: UpdateTaskDto ) =>
{
    const orgTask = await ensureTaskAccess(user, taskId);

    // allowedFields: [ "title", "description", "priority", "dueDate" ]
    const filteredPayload: UpdateTaskDto & { status?: TaskStatus; } = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    };
    if (orgTask.status === TaskStatus.DONE)
    {
        filteredPayload.status = TaskStatus.IN_PROGRESS;
    }

    const result = await prisma.$transaction(async (tx) => {
        const task = await tx.task.update({
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
        const activity = await createActivityService(tx, {
            type: ActivityType.TASK_UPDATED,
            actorId: user.userId,
            projectId: task.projectId,
            taskId: task.id,
            metadata: {
                fields: Object.keys(data)
            }
        });

        let statusActivity = null;
        if (orgTask.status !== task.status)
        {
            statusActivity = await createActivityService(tx, {
                type: ActivityType.TASK_STATUS_CHANGED,
                actorId: user.userId,
                projectId: task.projectId,
                taskId: task.id,
                metadata: {
                    from: orgTask.status,
                    to: task.status
                }
            });
        }
        return {
            task,
            activity,
            statusActivity
        };
    });

    emitTaskUpdated( result.task.projectId, result.task);
    emitActivity( result.task.projectId, result.activity);
    if (result.statusActivity)
    {
        emitActivity( result.task.projectId, result.statusActivity);
    }
    return result.task;
};

export const assignTaskService = async ( user: AuthContext, taskId: string, data: AssignTaskDto ) =>
{
    const task = await ensureTaskAccess(user, taskId);
    if (user.role === UserRole.DEVELOPER)
    {
        throw new ForbiddenError("Developers cannot assign tasks");
    }
    if (data.developerId)
    {
        await ensureDeveloper(data.developerId);
    }
    if (task.assignedDeveloperId === data.developerId)
    {
        throw new ConflictError("Task is already assigned to this developer");
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
            where: { id: taskId },
            data: {
                assignedDeveloperId: data.developerId,
                ...(task.status !== TaskStatus.IN_PROGRESS && { status: TaskStatus.IN_PROGRESS, }),
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

        let activityType: ActivityType;
        let metadata: Prisma.InputJsonValue | undefined;
        if (task.assignedDeveloperId === null && data.developerId !== null)
        {
            activityType = ActivityType.TASK_ASSIGNED;
            metadata = {
                fromDeveloperId: null,
                toDeveloperId: data.developerId
            };
        } else if (task.assignedDeveloperId !== null && data.developerId === null)
        {
            activityType = ActivityType.TASK_UNASSIGNED;
            metadata = {
                fromDeveloperId: task.assignedDeveloperId,
                toDeveloperId: null
            };
        } else
        {
            activityType = ActivityType.TASK_REASSIGNED;
            metadata = {
                fromDeveloperId: task.assignedDeveloperId,
                toDeveloperId: data.developerId
            };
        }

        const activity = await createActivityService(tx, {
            type: activityType,
            actorId: user.userId,
            projectId: updatedTask.projectId,
            taskId: updatedTask.id,
            metadata
        });

        let notification = null;
        if (data.developerId !== null && task.assignedDeveloperId !== data.developerId) {
            notification = await createNotificationService(tx, {
                type: NotificationType.TASK_ASSIGNED,
                recipientId: data.developerId,
                projectId: updatedTask.projectId,
                taskId: updatedTask.id,
                metadata: {
                    taskTitle: task.title
                }
            });
        }

        let statusActivity = null;
        if (task.status !== updatedTask.status) {
            statusActivity = await createActivityService(tx, {
                type: ActivityType.TASK_STATUS_CHANGED,
                actorId: user.userId,
                projectId: updatedTask.projectId,
                taskId: updatedTask.id,
                metadata: {
                    from: task.status,
                    to: updatedTask.status
                }
            });
        }
        return {
            task: updatedTask,
            activity,
            statusActivity,
            notification
        };
    });

    emitTaskUpdated( result.task.projectId, result.task);
    emitActivity( result.task.projectId, result.activity);
    if (result.statusActivity)
    {
        emitActivity( result.task.projectId, result.statusActivity);
    }
    if (result.notification)
    {
        emitNotification( result.notification.recipientId, result.notification);
    }
    return {
        id: result.task.id,
        assignedDeveloperId: result.task.assignedDeveloperId,
        updatedAt: result.task.updatedAt
    };
};

export const updateTaskStatusService = async ( user: AuthContext, taskId: string, data: UpdateTaskStatusDto ) =>
{
    const task = await ensureTaskAccess(user, taskId);

    const allowedTransitions = taskStatusTransitions[task.status];
    if (!allowedTransitions.includes(data.status))
    {
        throw new ConflictError(`Task cannot move from ${task.status} to ${data.status}.`);
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
            where: { id: taskId },
            data: {
                status: data.status
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
                updatedAt: true,
                project: {
                    select: {
                        managerId: true
                    }
                }
            }
        });

        const activity = await createActivityService(tx, {
            type: ActivityType.TASK_STATUS_CHANGED,
            actorId: user.userId,
            projectId: updatedTask.projectId,
            taskId: updatedTask.id,
            metadata: {
                from: task.status,
                to: updatedTask.status
            }
        });

        let notification = null;
        if (updatedTask.status === TaskStatus.IN_REVIEW && updatedTask.project.managerId !== null)
        {
            notification = await createNotificationService(tx, {
                type: NotificationType.TASK_IN_REVIEW,
                recipientId: updatedTask.project.managerId,
                projectId: updatedTask.projectId,
                taskId: updatedTask.id
            });
        }

        const { project: _project, ...updatedTaskData } = updatedTask;
        return {
            task: updatedTaskData,
            activity,
            notification
        };
    });

    emitTaskUpdated( result.task.projectId, result.task);
    emitActivity( result.task.projectId, result.activity);
    if (result.notification)
    {
        emitNotification( result.notification.recipientId, result.notification);
    }
    return {
        id: result.task.id,
        status: result.task.status,
        updatedAt: result.task.updatedAt
    };
};