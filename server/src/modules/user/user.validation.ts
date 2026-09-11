import { z } from "zod";

import { UserRole } from "@prisma/client";

export const updateUserRoleSchema = z.object({
    role: z.enum(UserRole),
});