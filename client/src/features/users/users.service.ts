import api from "../../lib/axios";
import type { UserRole } from "../auth/auth.types";
import type { ManagedUser, UsersResponse } from "./users.types";

export const getUsers = async (): Promise<ManagedUser[]> => {
    const response = await api.get<UsersResponse>("/users");
    return response.data.users;
};

export const updateUserRole = async (
    userId: string,
    role: UserRole
): Promise<ManagedUser> => {
    const response = await api.patch<{ user: ManagedUser }>(
        `/users/${userId}/role`,
        { role }
    );
    return response.data.user;
};
