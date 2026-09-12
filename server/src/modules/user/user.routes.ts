import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../shared/utils/validate.js";
import { getUsers, updateUserRole } from "./user.controller.js";
import { updateUserRoleSchema, userFiltersSchema } from "./user.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.patch( "/:userId/role", checkRole(UserRole.ADMIN), validate(updateUserRoleSchema), asyncHandler(updateUserRole));

router.get( "/", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(userFiltersSchema, "query"), getUsers);

export default router;