export type ProjectStatus =
    | "PLANNING"
    | "ACTIVE"
    | "ON_HOLD"
    | "COMPLETED"
    | "ABANDONED";

export interface Project {
    id: string;
    name: string;
    description?: string | null;
    status: ProjectStatus;
    clientId: string;
    createdById: string;
    managerId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    clientId: string;
    managerId?: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    clientId?: string;
    managerId?: string | null;
}

export interface ClientOption {
    id: string;
    name: string;
    email?: string | null;
    company?: string | null;
}

export interface ProjectManagerOption {
    id: string;
    name: string;
    email: string;
    role: string;
}
