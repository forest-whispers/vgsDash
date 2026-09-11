import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

import { ForbiddenError, UnauthorizedError } from "../errors/errors.js";

export const checkRole = (...allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) =>
    {
        if (!req.user)
        {
            next(new UnauthorizedError("Authentication required"));
            return;
        }
        const currentUserRole = req.user.role;
        if (!allowedRoles.includes(currentUserRole))
        {
            next(new ForbiddenError("You do not have permission to perform this action"));
            return;
        }
        next();
    };
};