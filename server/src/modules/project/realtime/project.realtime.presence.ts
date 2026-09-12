import type { UserRole } from "@prisma/client";

interface PresentUser
{
    role: UserRole;
    socketIds: Set<string>;
}

const projectPresence = new Map<string, Map<string, PresentUser>>();

export const addSocketToProject = (projectId: string, userId: string, role: UserRole, socketId: string) =>
{
    let users = projectPresence.get(projectId);
    if (!users)
    {
        users = new Map();
        projectPresence.set(projectId, users);
    }

    let user = users.get(userId);
    if (!user)
    {
        user = {
            role,
            socketIds: new Set(),
        };
        users.set(userId, user);
    }

    const wasAlreadyOffline = user.socketIds.size === 0;
    user.socketIds.add(socketId);

    return wasAlreadyOffline;
};

export const removeSocketFromProject = (projectId: string, userId: string, socketId: string) =>
{
    const users = projectPresence.get(projectId);
    if (!users)
    {
        return false;
    }

    const user = users.get(userId);
    if (!user)
    {
        return false;
    }

    user.socketIds.delete(socketId);

    const wentOffline = user.socketIds.size === 0;
    if (wentOffline)
    {
        users.delete(userId);
    }

    if (users.size === 0)
    {
        projectPresence.delete(projectId);
    }

    return wentOffline;
};

export const getProjectPresence = (projectId: string) =>
{
    const users = projectPresence.get(projectId);
    if (!users)
    {
        return [];
    }

    return Array.from(users.entries()).map(([id, user]) => ({
        id,
        role: user.role
    }));
};