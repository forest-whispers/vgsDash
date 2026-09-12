import type { Request, Response } from "express";

import { getUsersService, updateUserRoleService } from "./user.service.js";

export const updateUserRole = async (req: Request, res: Response) =>
{
    const userId = req.params.userId as string;
    const user = await updateUserRoleService(
        req.user!.userId,
        userId,
        req.body
    );
    return res.status(200).json({
        user
    });
};

export const getUsers = async (req: Request, res: Response) => {
    const users = await getUsersService(
        req.user!,
        req.query
    );
    res.status(200).json(users);
};