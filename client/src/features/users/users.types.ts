import type { UserRole } from "../auth/auth.types";

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface UsersResponse {
    users: ManagedUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
