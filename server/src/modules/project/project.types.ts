import type { ProjectStatus } from "@prisma/client";

export interface CreateProjectDto
{
    name: string;
    description?: string;
    clientId: string;
    managerId?: string | null;
}

export interface UpdateProjectDto
{
    name?: string;
    description?: string;
    clientId?: string;
    managerId?: string | null;
}