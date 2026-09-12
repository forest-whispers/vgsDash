import { z } from "zod";

import { UserRole } from "@prisma/client";

export const updateUserRoleSchema = z.object({
    role: z.enum(UserRole),
});

export const userFiltersSchema = z.object({
    role: z.enum(UserRole).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});