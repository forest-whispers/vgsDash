export type UserRole =
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";

export interface RegisterData
{
    name: string;
    email: string;
    password: string;
}

export interface LoginCredentials
{
    email: string;
    password: string;
}

export interface AuthenticatedUser
{
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthContextValue
{
    user: AuthenticatedUser | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}