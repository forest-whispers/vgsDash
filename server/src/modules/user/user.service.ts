import { UserRole } from "@prisma/client";
import { prisma } from "../../shared/config/prisma.js";

import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/errors.js";
import type { AuthContext } from "../auth/auth.types.js";
import type { ConfigureUserRoleDto, UserFilters } from "./user.types.js";

export const updateUserRoleService = async (requesterId: string, targetId: string, data: ConfigureUserRoleDto) =>
{
    if (requesterId === targetId)
    {
        throw new ForbiddenError("You cannot change your own role");
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
    if (!targetUser)
    {
        throw new NotFoundError("User not found");
    }
    if (targetUser.role === data.role)
    {
        throw new ConflictError("User already has this role");
    }

    return prisma.user.update({
        where: { id: targetId },
        data: {
            role: data.role
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

export const getUsersService = async ( user: AuthContext, filters: UserFilters ) =>
{
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PROJECT_MANAGER)
    {
        throw new ForbiddenError("Only admins and project managers can access users");
    }
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
        ...(filters.role && { role: filters.role }),
        ...(filters.search && {
            OR: [
                {
                    name: {
                        contains: filters.search,
                        mode: "insensitive" as const
                    }
                },
                {
                    email: {
                        contains: filters.search,
                        mode: "insensitive" as const
                    }
                }
            ]
        })
    }

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
    };
};