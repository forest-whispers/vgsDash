import type { UserRole } from "@prisma/client";

export interface ConfigureUserRoleDto
{
    role: UserRole;
}

export interface UserFilters
{
    role?: UserRole;
    search?: string;
    page?: number;
    limit?: number;
}