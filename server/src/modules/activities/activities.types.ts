import type { ActivityType, Prisma } from "@prisma/client";

export interface ActivityMetadata
{
    from?: string;
    to?: string;
    fromDeveloperId?: string | null;
    toDeveloperId?: string | null;
    fields?: string[];
}

export interface CreateActivity
{
    type: ActivityType;
    actorId: string;
    projectId: string;
    taskId?: string;
    metadata?: Prisma.InputJsonValue;
}

export interface ActivityResponse
{
    id: string;
    type: ActivityType;
    actor: {
        id: string;
        name: string;
    };
    projectId: string;
    taskId: string | null;
    metadata: unknown;
    createdAt: Date;
}

export interface ActivityFilters
{
    limit?: number;
}