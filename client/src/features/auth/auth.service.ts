import api, { setAccessToken } from "../../lib/axios";
import type { AuthenticatedUser, LoginCredentials, RegisterData } from "./auth.types";

export const login = async ( credentials: LoginCredentials ) =>
{
    const response = await api.post<{ accessToken: string; user: AuthenticatedUser }>(
        "/auth/login",
        credentials
    );
    setAccessToken(response.data.accessToken);
    return response.data.user;
};

export const register = async ( data: RegisterData ) =>
{
    await api.post(
        "/auth/register",
        data
    );
};

export const getCurrentUser = async () =>
{
    const response = await api.get<{ user: AuthenticatedUser }>(
        "/auth/me"
    );
    return response.data.user;
};

export const refresh = async () => {
    const response = await api.post<{ accessToken: string }>("/auth/refresh");
    setAccessToken(response.data.accessToken);
    return response.data.accessToken;
};

export const logout = async () =>
{
    try {
        await api.post("/auth/logout");
    } finally {
        setAccessToken(null);
    }
};