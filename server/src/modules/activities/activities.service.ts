import { UserRole, Prisma } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { ForbiddenError } from "../../shared/errors/errors.js";
import type { AuthContext } from "../auth/auth.types.js";
import type { ActivityFilters } from "./activities.types.js";

export const getActivitiesService = async ( user: AuthContext, filters: ActivityFilters ) =>
{
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PROJECT_MANAGER && user.role !== UserRole.DEVELOPER)
    {
        throw new ForbiddenError("You do not have permission to view activities");
    }

    const limit = filters.limit || 20;

    return prisma.activity.findMany({
        where: {
            ...(user.role === UserRole.PROJECT_MANAGER && { project: { managerId: user.userId } }),
            ...(user.role === UserRole.DEVELOPER && { task: { assignedDeveloperId: user.userId } }),
        },
        select: {
            id: true,
            type: true,
            actor: {
                select: {
                    id: true,
                    name: true
                },
            },
            projectId: true,
            taskId: true,
            metadata: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit
    });
};