import { prisma } from "../../shared/config/prisma.js";

import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/errors.js";
import type { ConfigureUserRoleDto } from "./user.types.js";

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
        },
    });
}