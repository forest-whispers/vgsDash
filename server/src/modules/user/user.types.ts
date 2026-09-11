import type { UserRole } from "@prisma/client";

export interface ConfigureUserRoleDto
{
    role: UserRole;
}