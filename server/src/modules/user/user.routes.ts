import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../shared/utils/validate.js";
import { updateUserRole } from "./user.controller.js";
import { updateUserRoleSchema } from "./user.validation.js";

const router = Router({ mergeParams: true });

router.patch( "/:userId/role", authenticate, checkRole(UserRole.ADMIN), validate(updateUserRoleSchema), asyncHandler(updateUserRole));

export default router;