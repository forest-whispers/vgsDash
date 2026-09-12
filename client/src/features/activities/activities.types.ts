export type ActivityType =
    | "PROJECT_CREATED"
    | "PROJECT_UPDATED"
    | "PROJECT_ABANDONED"
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_ASSIGNED"
    | "TASK_REASSIGNED"
    | "TASK_UNASSIGNED"
    | "TASK_STATUS_CHANGED";

export interface ActivityActor {
    id: string;
    name: string;
}

export interface ActivityMetadata {
    fields?: string[];
    from?: string;
    to?: string;
    fromDeveloperId?: string | null;
    toDeveloperId?: string | null;
    [key: string]: unknown;
}

export interface Activity {
    id: string;
    type: ActivityType;
    actor: ActivityActor;
    projectId: string;
    taskId: string | null;
    metadata: ActivityMetadata | null;
    createdAt: string;
}

export interface ActivityFilters {
    limit?: number;
}
