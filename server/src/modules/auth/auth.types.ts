import { UserRole } from "@prisma/client";

export interface RegisterDto
{
    name: string;
    email: string;
    password: string;
}

export interface LoginDto
{
    email: string;
    password: string;
}

export interface AuthTokens
{
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string;
    role: UserRole;
}

export interface AuthenticatedUser
{
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthContext {
    userId: string;
    role: UserRole;
}