import { Prisma, UserRole, } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { constants } from "../../shared/config/constants.js";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, } from "../../shared/errors/errors.js";
import { comparePassword, hashPassword, } from "../../shared/lib/bcrypt.js";
import { generateAccessToken, } from "../../shared/lib/jwt.js";
import { hashToken, } from "../../shared/lib/hash.js";
import { generateRefreshToken, } from "../../shared/lib/crypto.js";
import type { AuthenticatedUser, AuthTokens, LoginDto, RegisterDto, } from "./auth.types.js";

export const registerService = async ({ name, email, password }: RegisterDto) =>
{
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser)
    {
        throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    try
    {
        const user = await prisma.$transaction(
            async (tx) =>
            {
                const usersCount = await tx.user.count();
                let role: UserRole;
                if (usersCount === 0)
                {
                    role = UserRole.ADMIN;
                } else
                {
                    role = UserRole.DEVELOPER;
                }
                return tx.user.create({
                    data: {
                        name: name,
                        email,
                        passwordHash,
                        role
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });
            },
        );
        return user;
    } catch (error)
    {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ConflictError("A user with this email already exists.");
            }
        }
        throw new InternalServerError("Unable to create user");
    }
};

export const loginService = async ({ email, password }: LoginDto): Promise<AuthTokens &
{ user: AuthenticatedUser }> =>
{
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user)
    {
        throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatched = await comparePassword(password, user.passwordHash);
    if (!passwordMatched)
    {
        throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role
    });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt: new Date(Date.now() + constants.REFRESH_TOKEN_TTL_MS)
        }
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    };
};

export const refreshService = async (refreshToken?: string): Promise<AuthTokens> =>
{
    if (!refreshToken)
    {
        throw new UnauthorizedError("Refresh token is required");
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true }
    });
    if (!storedToken)
    {
        throw new UnauthorizedError("Refresh token is invalid");
    }
    if (storedToken.revokedAt)
    {
        throw new UnauthorizedError("Refresh token has been revoked");
    }
    if (storedToken.expiresAt <= new Date())
    {
        throw new UnauthorizedError("Refresh token has already expired");
    }

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);
    const now = new Date();

    await prisma.$transaction(async (tx) => {
        const revoked = await tx.refreshToken.updateMany({
            where: {
                id: storedToken.id,
                revokedAt: null
            },
            data: {
                revokedAt: now
            }
        });
        if (revoked.count !== 1)
        {
            throw new UnauthorizedError("Refresh token has already been used");
        }
        await tx.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: storedToken.userId,
                expiresAt: new Date(Date.now() + constants.REFRESH_TOKEN_TTL_MS)
            }
        });
    });

    const accessToken = generateAccessToken({
        userId: storedToken.user.id,
        role: storedToken.user.role
    });

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};

export const logoutService = async (refreshToken?: string): Promise<void> =>
{
    if (!refreshToken)
    {
        return;
    }
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null
        },
        data: {
            revokedAt: new Date()
        }
    });
};

export const getMeService = async (userId: string) =>
{
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
    if (!user)
    {
        throw new NotFoundError("User not found.");
    }
    return user;
};